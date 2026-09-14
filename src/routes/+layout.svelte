<script lang="ts">
  import FluentIconCalendarMonth from '@oneo/fluentui-icons-like/FluentIconCalendarMonth.svelte';
  import '../app.css';

  let { children } = $props();
</script>

<div class="flex min-h-svh flex-col bg-background text-foreground">
  <header class="sticky top-0 z-30 border-b border-border/70 bg-background">
    <div class="mx-auto flex h-14 max-w-5xl items-center gap-3 px-5 sm:px-6">
      <a
        href="/"
        class="flex min-w-0 items-center gap-2.5 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
        <span
          class="grid size-7 shrink-0 place-items-center rounded-lg border border-primary/60 bg-primary text-primary-foreground shadow-xs">
          <FluentIconCalendarMonth
            size={18}
            style="Regular"
            aria-hidden="true" />
        </span>
        <span class="truncate text-sm font-semibold tracking-tight">
          中国节假日日历
        </span>
      </a>

      <nav class="ml-auto flex shrink-0 items-center gap-1">
        <a
          href="https://github.com/oneo-me/china-holidays"
          target="_blank"
          rel="noopener noreferrer"
          class="flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
          <svg
            viewBox="0 0 16 16"
            fill="currentColor"
            class="size-4 shrink-0"
            aria-hidden="true">
            <path
              d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
          </svg>
          GitHub
        </a>
      </nav>
    </div>
  </header>

  <main class="flex-1">
    {@render children()}
  </main>

  <footer class="border-t border-border/70">
    <div
      class="mx-auto flex max-w-5xl flex-col gap-3 px-5 py-6 text-[11px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <p>
        数据来源：Apple iCloud
        中国节假日日历；补充节日由本项目按规则生成，法定安排以官方公布为准。
      </p>
      <a
        href="/calendars.ics"
        class="shrink-0 transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
        下载 ICS 文件
      </a>
    </div>
  </footer>
</div>
