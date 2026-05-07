package main

import (
	"embed"
	"errors"
	"fmt"
	"io/fs"
	"log"
	"mime"
	"net"
	"net/http"
	"os/exec"
	"runtime"
	"strings"
)

//go:embed web/dist
var embeddedFiles embed.FS

func main() {
	if err := mime.AddExtensionType(".js", "text/javascript; charset=utf-8"); err != nil {
		log.Printf("register js mime type: %v", err)
	}

	dist, err := fs.Sub(embeddedFiles, "web/dist")
	if err != nil {
		log.Fatalf("load embedded web assets: %v", err)
	}

	listener, err := net.Listen("tcp", "127.0.0.1:0")
	if err != nil {
		log.Fatalf("start listener: %v", err)
	}
	defer listener.Close()

	mux := http.NewServeMux()
	mux.Handle("/", spaHandler(dist))

	url := fmt.Sprintf("http://%s", listener.Addr().String())
	fmt.Printf("DataMock is running at %s\n", url)

	go func() {
		if err := openBrowser(url); err != nil {
			log.Printf("open browser: %v", err)
		}
	}()

	if err := http.Serve(listener, mux); err != nil && !errors.Is(err, http.ErrServerClosed) {
		log.Fatalf("serve: %v", err)
	}
}

func spaHandler(files fs.FS) http.Handler {
	fileServer := http.FileServer(http.FS(files))

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		path := strings.TrimPrefix(r.URL.Path, "/")
		if path == "" {
			path = "index.html"
		}

		file, err := files.Open(path)
		if err == nil {
			_ = file.Close()
			fileServer.ServeHTTP(w, r)
			return
		}

		r.URL.Path = "/index.html"
		fileServer.ServeHTTP(w, r)
	})
}

func openBrowser(url string) error {
	var cmd *exec.Cmd

	switch runtime.GOOS {
	case "windows":
		cmd = exec.Command("rundll32", "url.dll,FileProtocolHandler", url)
	case "darwin":
		cmd = exec.Command("open", url)
	default:
		cmd = exec.Command("xdg-open", url)
	}

	return cmd.Start()
}
