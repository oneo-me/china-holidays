<script lang="ts">
  import FluentIconCheckmark from '@oneo/fluentui-icons-like/FluentIconCheckmark.svelte';
  import FluentIconCopy from '@oneo/fluentui-icons-like/FluentIconCopy.svelte';
  import type { CalendarEvent } from '$lib/ics-parser';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();

  let selectedYear = $state(new Date().getFullYear());
  let copyStatus = $state<'idle' | 'copied' | 'failed'>('idle');
  let subscribeUrl = $state('/calendars.ics');

  const copyMessage = $derived(
    copyStatus === 'copied'
      ? '订阅链接已复制'
      : copyStatus === 'failed'
        ? '复制失败，请手动选择链接'
        : '',
  );

  $effect(() => {
    subscribeUrl = `${window.location.origin}/calendars.ics`;
  });

  $effect(() => {
    if (copyStatus === 'idle') return;
    const timer = setTimeout(() => (copyStatus = 'idle'), 2400);
    return () => clearTimeout(timer);
  });

  const years = $derived(
    Object.keys(data.eventsByYear)
      .map(Number)
      .sort((a, b) => a - b),
  );
  const yearRange = $derived(
    years.length ? `${years[0]} – ${years[years.length - 1]}` : '—',
  );
  const currentYearEvents = $derived(data.eventsByYear[selectedYear] || []);
  const months = $derived(groupByMonth(currentYearEvents));
  const yearStats = $derived({
    total: currentYearEvents.length,
    holiday: currentYearEvents.filter((event) => event.isHoliday).length,
    workday: currentYearEvents.filter((event) => event.isWorkday).length,
    extra: currentYearEvents.filter((event) => event.source === 'extra').length,
  });

  function groupByMonth(events: CalendarEvent[]) {
    const groups: { month: number; events: CalendarEvent[] }[] = [];
    for (const event of events) {
      const month = Number(event.date.slice(5, 7));
      const last = groups[groups.length - 1];
      if (last && last.month === month) last.events.push(event);
      else groups.push({ month, events: [event] });
    }
    return groups;
  }

  function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}月${date.getDate()}日`;
  }

  function getWeekday(dateStr: string): string {
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    const date = new Date(dateStr);
    return weekdays[date.getDay()];
  }

  function formatBeijingTime(timestamp: number): string {
    const date = new Date(timestamp + 8 * 3600000);
    const pad = (value: number) => String(value).padStart(2, '0');
    return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())} ${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}`;
  }

  function getEventBadge(event: {
    isHoliday?: boolean;
    isWorkday?: boolean;
    source: string;
  }) {
    if (event.isHoliday)
      return { text: '休', className: 'bg-success/12 text-success' };
    if (event.isWorkday)
      return { text: '班', className: 'bg-warning/12 text-warning' };
    if (event.source === 'extra')
      return { text: '补', className: 'bg-muted text-muted-foreground' };
    return null;
  }

  async function copyToClipboard() {
    try {
      await navigator.clipboard.writeText(subscribeUrl);
      copyStatus = 'copied';
    } catch {
      copyStatus = 'failed';
    }
  }
</script>

<svelte:head>
  <title>中国节假日日历</title>
  <meta
    name="description"
    content="中国节假日日历订阅服务，包含法定节假日、调休安排及更多节日" />
</svelte:head>

<div class="mx-auto max-w-5xl px-5 py-10 sm:px-6">
  <section
    class="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_21rem] lg:gap-10">
    <div class="lg:pt-1">
      <h1 class="text-2xl font-semibold tracking-tight sm:text-3xl">
        中国节假日日历
      </h1>
      <p class="mt-3 max-w-prose text-sm leading-relaxed text-muted-foreground">
        提供中国大陆的法定节假日与调休上班日，并把情人节、教师节、七夕、冬至等常见节日一并纳入。订阅一次，节假日与调休会出现在你原本使用的日历里。
      </p>
      {#if !data.error}
        <p class="mt-4 text-[11px] text-muted-foreground">
          数据范围 {yearRange} · 共 {data.totalCount} 条
        </p>
      {/if}
    </div>

    <section
      id="subscribe"
      class="scroll-mt-20 rounded-xl border border-border bg-card p-5 shadow-sm"
      aria-labelledby="subscribe-heading">
      <h2 id="subscribe-heading" class="text-sm font-semibold">订阅地址</h2>
      <p class="mt-1 text-xs text-muted-foreground">
        复制下面的地址，按「如何订阅」中的步骤添加到日历客户端。
      </p>

      <div class="mt-3 flex gap-2">
        <input
          type="text"
          readonly
          value={subscribeUrl}
          aria-label="日历订阅链接"
          class="h-9 min-w-0 flex-1 select-all rounded-lg border border-input bg-background px-2.5 font-mono text-xs text-muted-foreground" />
        <button
          type="button"
          onclick={copyToClipboard}
          class="flex h-9 min-w-24 shrink-0 items-center justify-center gap-1.5 rounded-lg border border-primary/60 bg-primary px-3 text-xs font-medium text-primary-foreground shadow-xs transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:scale-[0.98] motion-reduce:active:scale-100">
          {#if copyStatus === 'copied'}
            <FluentIconCheckmark
              size={16}
              style="Regular"
              aria-hidden="true" />
            已复制
          {:else}
            <FluentIconCopy size={16} style="Regular" aria-hidden="true" />
            {copyStatus === 'failed' ? '复制失败' : '复制链接'}
          {/if}
        </button>
      </div>

      <span class="sr-only" aria-live="polite">{copyMessage}</span>
    </section>
  </section>

  {#if data.error}
    <div
      class="mt-8 max-w-prose rounded-xl border border-destructive/40 bg-destructive/5 p-5"
      role="alert">
      <p class="text-sm font-medium text-destructive">{data.error}</p>
      <p class="mt-1.5 text-xs leading-relaxed text-muted-foreground">
        节假日数据来自 Apple iCloud
        中国节假日日历，网络暂时不可用时会加载失败；请稍后刷新页面重试。
      </p>
    </div>
  {:else}
    <section class="mt-10" aria-labelledby="steps-heading">
      <h2 id="steps-heading" class="text-lg font-semibold tracking-tight">
        如何订阅
      </h2>

      <div class="mt-4 grid gap-4 md:grid-cols-2">
        <div class="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h3 class="text-sm font-semibold">Apple 日历</h3>
          <p class="mt-1 text-xs text-muted-foreground">
            在 Mac 与 iPhone / iPad 上分别添加，「位置」或「账户」选 iCloud
            后可在所有设备同步。
          </p>

          <div class="mt-3.5">
            <h4 class="text-[11px] font-semibold">Mac</h4>
            <ol
              class="mt-1.5 list-decimal space-y-1 pl-4 text-xs text-muted-foreground">
              <li>打开「日历」，选取「文件」→「新建日历订阅」</li>
              <li>粘贴上方地址，点「订阅」</li>
              <li>填写名称并选颜色，把「位置」设为 iCloud，点「好」</li>
            </ol>
          </div>

          <div class="mt-3.5">
            <h4 class="text-[11px] font-semibold">iPhone / iPad</h4>
            <ol
              class="mt-1.5 list-decimal space-y-1 pl-4 text-xs text-muted-foreground">
              <li>打开「日历」，点顶部的「日历」</li>
              <li>点「添加日历」→「添加订阅日历」</li>
              <li>粘贴上方地址，点「查找」</li>
              <li>把「账户」设为 iCloud，点「完成」</li>
            </ol>
          </div>
        </div>

        <div class="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h3 class="text-sm font-semibold">Google Calendar</h3>
          <p class="mt-1 text-xs text-muted-foreground">
            在电脑上打开 Google Calendar 网页版添加，手机 App
            不支持通过网址订阅。
          </p>

          <ol
            class="mt-3.5 list-decimal space-y-1 pl-4 text-xs text-muted-foreground">
            <li>打开 calendar.google.com</li>
            <li>左侧「其他日历」旁点「+」</li>
            <li>选择「通过网址添加」</li>
            <li>粘贴上方地址，点「添加日历」</li>
          </ol>

          <p class="mt-3.5 text-[11px] text-muted-foreground">
            Google 按自己的计划拉取订阅地址，更新最长可能延迟 24 小时。
          </p>
        </div>
      </div>
    </section>

    <section class="mt-10" aria-labelledby="calendar-heading">
      <div class="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2
            id="calendar-heading"
            class="text-lg font-semibold tracking-tight">
            节日列表
          </h2>
          <p class="mt-1 text-xs text-muted-foreground">
            按日期排列，包含法定假日、调休上班日与补充节日；无标记的条目是来源日历中的节气与节日名称。
          </p>
        </div>

        <fieldset class="flex min-w-0 flex-wrap gap-1.5">
          <legend class="sr-only">选择年份</legend>
          {#each years as year}
            <button
              type="button"
              onclick={() => (selectedYear = year)}
              aria-pressed={selectedYear === year}
              class="h-8 rounded-lg border px-3 text-xs font-medium tabular-nums transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:scale-[0.98] motion-reduce:active:scale-100 {selectedYear ===
              year
                ? 'border-primary/60 bg-primary text-primary-foreground shadow-xs'
                : 'border-border bg-card text-muted-foreground'}">
              {year}
            </button>
          {/each}
        </fieldset>
      </div>

      <dl class="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div
          class="rounded-xl border border-border bg-card px-4 py-3 shadow-xs">
          <dt class="text-[11px] text-muted-foreground">
            {selectedYear}
            年条目
          </dt>
          <dd class="mt-1 text-xl font-semibold tabular-nums">
            {yearStats.total}
          </dd>
        </div>
        <div
          class="rounded-xl border border-border bg-card px-4 py-3 shadow-xs">
          <dt class="text-[11px] text-muted-foreground">法定假日</dt>
          <dd class="mt-1 text-xl font-semibold tabular-nums">
            {yearStats.holiday}
          </dd>
        </div>
        <div
          class="rounded-xl border border-border bg-card px-4 py-3 shadow-xs">
          <dt class="text-[11px] text-muted-foreground">调休上班</dt>
          <dd class="mt-1 text-xl font-semibold tabular-nums">
            {yearStats.workday}
          </dd>
        </div>
        <div
          class="rounded-xl border border-border bg-card px-4 py-3 shadow-xs">
          <dt class="text-[11px] text-muted-foreground">补充节日</dt>
          <dd class="mt-1 text-xl font-semibold tabular-nums">
            {yearStats.extra}
          </dd>
        </div>
      </dl>

      <div
        class="mt-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <div
          class="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-muted-foreground">
          <span class="flex items-center gap-1.5">
            <span
              class="rounded-md bg-success/12 px-1.5 py-px font-medium text-success"
              >休</span
            >
            法定假日
          </span>
          <span class="flex items-center gap-1.5">
            <span
              class="rounded-md bg-warning/12 px-1.5 py-px font-medium text-warning"
              >班</span
            >
            调休上班
          </span>
          <span class="flex items-center gap-1.5">
            <span
              class="rounded-md bg-muted px-1.5 py-px font-medium text-muted-foreground"
              >补</span
            >
            补充节日
          </span>
        </div>

        {#if data.updatedAt}
          <p class="text-[11px] text-muted-foreground">
            每 12 小时自动同步 · 最近同步
            {formatBeijingTime(data.updatedAt)}（北京时间）
          </p>
        {/if}
      </div>

      {#if months.length === 0}
        <p
          class="mt-3 rounded-xl border border-dashed border-border bg-card p-8 text-center text-xs text-muted-foreground">
          {selectedYear}
          年暂无节日数据
        </p>
      {:else}
        <div
          class="mt-3 overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <table class="w-full border-collapse text-xs">
            <caption class="sr-only">
              {selectedYear}
              年节日列表
            </caption>
            <thead>
              <tr class="border-b border-border bg-muted/40 text-left">
                <th
                  scope="col"
                  class="w-16 px-3 py-2.5 font-medium text-muted-foreground sm:w-20 sm:px-4">
                  日期
                </th>
                <th
                  scope="col"
                  class="w-11 px-2 py-2.5 font-medium text-muted-foreground">
                  星期
                </th>
                <th
                  scope="col"
                  class="px-2 py-2.5 font-medium text-muted-foreground">
                  节日
                </th>
                <th
                  scope="col"
                  class="hidden px-2 py-2.5 font-medium text-muted-foreground md:table-cell">
                  说明
                </th>
                <th
                  scope="col"
                  class="w-14 px-3 py-2.5 text-right font-medium text-muted-foreground sm:px-4">
                  标记
                </th>
              </tr>
            </thead>
            {#each months as group (group.month)}
              <tbody class="border-b border-border/60 last:border-b-0">
                <tr>
                  <th
                    scope="colgroup"
                    colspan="5"
                    class="bg-muted/30 px-3 py-1.5 text-left font-medium text-muted-foreground sm:px-4">
                    {group.month}
                    月
                  </th>
                </tr>
                {#each group.events as event (event.uid)}
                  {@const badge = getEventBadge(event)}
                  <tr
                    class="border-t border-border/40 transition-colors hover:bg-muted/40">
                    <td class="px-3 py-2 sm:px-4">
                      <time
                        datetime={event.date}
                        class="tabular-nums text-muted-foreground">
                        {formatDate(event.date)}
                      </time>
                    </td>
                    <td class="px-2 py-2 text-muted-foreground">
                      {getWeekday(event.date)}
                    </td>
                    <td class="px-2 py-2">{event.summary}</td>
                    <td
                      class="hidden px-2 py-2 text-muted-foreground md:table-cell">
                      {event.description ?? ''}
                    </td>
                    <td class="px-3 py-2 text-right sm:px-4">
                      {#if badge}
                        <span
                          class="inline-block rounded-md px-1.5 py-px font-medium {badge.className}">
                          {badge.text}
                        </span>
                      {/if}
                    </td>
                  </tr>
                {/each}
              </tbody>
            {/each}
          </table>
        </div>
      {/if}
    </section>
  {/if}
</div>
