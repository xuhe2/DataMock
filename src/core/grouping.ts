export const UNGROUPED_LABEL = "Ungrouped";

export type GroupableItem = {
  group?: string;
};

export type ItemGroup<T> = {
  name: string;
  items: T[];
};

export function getItemGroupName(item: GroupableItem): string {
  return item.group?.trim() || UNGROUPED_LABEL;
}

export function normalizeGroupName(group: string): string | undefined {
  return group.trim() || undefined;
}

export function groupItems<T extends GroupableItem>(items: T[]): ItemGroup<T>[] {
  const groups = new Map<string, T[]>();

  items.forEach((item) => {
    const groupName = getItemGroupName(item);
    const group = groups.get(groupName);
    if (group) {
      group.push(item);
      return;
    }

    groups.set(groupName, [item]);
  });

  return Array.from(groups, ([name, groupItems]) => ({
    name,
    items: groupItems,
  }));
}
