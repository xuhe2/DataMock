package main

import (
	"embed"
	"errors"
	"flag"
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

const defaultPort = 5179

//go:embed web/dist
var embeddedFiles embed.FS

func main() {
	host := flag.String("host", "127.0.0.1", "host address to listen on")
	port := flag.Int("port", defaultPort, "port to listen on, use 0 for a random available port")
	noOpen := flag.Bool("no-open", false, "do not open the browser automatically")
	flag.Parse()

	if err := mime.AddExtensionType(".js", "text/javascript; charset=utf-8"); err != nil {
		log.Printf("register js mime type: %v", err)
	}

	dist, err := fs.Sub(embeddedFiles, "web/dist")
	if err != nil {
		log.Fatalf("load embedded web assets: %v", err)
	}

	listener, err := listen(*host, *port)
	if err != nil {
		log.Fatalf("start listener: %v", err)
	}
	defer listener.Close()

	mux := http.NewServeMux()
	mux.Handle("/", spaHandler(dist))

	url := fmt.Sprintf("http://%s", listener.Addr().String())
	fmt.Printf("DataMock is running at %s\n", url)

	if !*noOpen {
		go func() {
			if err := openBrowser(url); err != nil {
				log.Printf("open browser: %v", err)
			}
		}()
	}

	if err := http.Serve(listener, mux); err != nil && !errors.Is(err, http.ErrServerClosed) {
		log.Fatalf("serve: %v", err)
	}
}

func listen(host string, port int) (net.Listener, error) {
	address := fmt.Sprintf("%s:%d", host, port)
	listener, err := net.Listen("tcp", address)
	if err == nil {
		return listener, nil
	}

	if port == 0 {
		return nil, err
	}

	log.Printf("%s is unavailable, falling back to a random port: %v", address, err)
	return net.Listen("tcp", fmt.Sprintf("%s:0", host))
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
