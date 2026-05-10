<script lang="ts">
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();

  let selectedYear = $state(new Date().getFullYear());
  let showSubscribeInfo = $state(false);

  const years = $derived(
    Object.keys(data.eventsByYear)
      .map(Number)
      .sort((a, b) => a - b),
  );
  const currentYearEvents = $derived(data.eventsByYear[selectedYear] || []);

  function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}月${date.getDate()}日`;
  }

  function getWeekday(dateStr: string): string {
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    const date = new Date(dateStr);
    return weekdays[date.getDay()];
  }

  function getEventBadge(event: {
    isHoliday?: boolean;
    isWorkday?: boolean;
    source: string;
  }) {
    if (event.isHoliday)
      return {
        text: '休',
        bg: 'bg-success/12',
        textColor: 'text-success',
      };
    if (event.isWorkday)
      return {
        text: '班',
        bg: 'bg-warning/12',
        textColor: 'text-warning',
      };
    if (event.source === 'extra')
      return {
        text: '补',
        bg: 'bg-primary/12',
        textColor: 'text-primary',
      };
    return null;
  }

  async function copyToClipboard() {
    const url = `${window.location.origin}/calendars.ics`;
    await navigator.clipboard.writeText(url);
    alert('订阅链接已复制！');
  }
</script>

<svelte:head>
  <title>中国节假日日历</title>
  <meta
    name="description"
    content="中国节假日日历订阅服务，包含法定节假日、调休安排及更多节日" />
</svelte:head>

<div class="max-w-4xl mx-auto px-6 py-5">
  <header class="mb-3">
    <h1 class="text-lg font-semibold mb-0.5">中国节假日日历</h1>
    <p class="text-xs text-muted-foreground">
      包含法定节假日、调休安排、西方节日、网络节日及传统节日
    </p>
  </header>

  <div class="mb-3 p-3 bg-card border rounded-[10px]">
    <div class="flex items-center gap-3">
      <input
        type="text"
        readonly
        value="{typeof window !== 'undefined' ? window.location.origin : ''}/calendars.ics"
        class="flex-1 px-2.5 h-7 bg-muted border rounded-[8px] text-xs font-mono" />
      <button
        type="button"
        onclick={copyToClipboard}
        class="px-3 h-7 bg-primary text-primary-foreground rounded-[10px] text-xs font-medium transition-colors duration-150 active:scale-[0.97] hover:opacity-90 shrink-0">
        复制链接
      </button>
    </div>

    <button
      type="button"
      onclick={() => showSubscribeInfo = !showSubscribeInfo}
      class="mt-2 text-xs text-muted-foreground hover:text-foreground underline">
      {showSubscribeInfo ? '收起' : '如何订阅？'}
    </button>

    {#if showSubscribeInfo}
      <div class="mt-2 p-2.5 bg-muted rounded-[8px] text-xs">
        <h3 class="font-semibold text-[11px] mb-1.5">iOS / macOS 日历</h3>
        <ol class="list-decimal list-inside space-y-0.5 mb-3">
          <li>打开系统「设置」→ App → 日历 → 日历账户</li>
          <li>选择「添加账户」→ 其他</li>
          <li>选择「添加已订阅的日历」</li>
          <li>粘贴上方链接，点击订阅</li>
        </ol>

        <h3 class="font-semibold text-[11px] mb-1.5">Google Calendar</h3>
        <ol class="list-decimal list-inside space-y-0.5">
          <li>打开 Google Calendar 网页版</li>
          <li>左侧「其他日历」旁点击 +</li>
          <li>选择「通过网址添加」</li>
          <li>粘贴上方链接，点击添加日历</li>
        </ol>
      </div>
    {/if}
  </div>

  <div class="mb-3 p-3 bg-muted rounded-[10px]">
    <h3 class="text-xs font-semibold mb-2">图例</h3>
    <div class="flex flex-wrap gap-3 text-xs">
      <div class="flex items-center gap-1.5">
        <span
          class="px-1.5 py-px text-[11px] rounded-[6px] font-medium bg-success/12 text-success"
          >休</span
        >
        <span>法定假日</span>
      </div>
      <div class="flex items-center gap-1.5">
        <span
          class="px-1.5 py-px text-[11px] rounded-[6px] font-medium bg-warning/12 text-warning"
          >班</span
        >
        <span>调休上班</span>
      </div>
      <div class="flex items-center gap-1.5">
        <span
          class="px-1.5 py-px text-[11px] rounded-[6px] font-medium bg-primary/12 text-primary"
          >补</span
        >
        <span>补充节日</span>
      </div>
    </div>
  </div>

  {#if data.error}
    <div
      class="bg-destructive/10 border border-destructive rounded-[10px] p-3 mb-4">
      <p class="text-destructive text-xs">{data.error}</p>
    </div>
  {:else}
    <div class="flex gap-2 mb-3 flex-wrap">
      <div class="bg-card border rounded-[10px] px-3 py-1.5">
        <span class="text-[11px] text-muted-foreground">总计</span>
        <span class="ml-2 text-lg font-semibold">{data.totalCount}个节日</span>
      </div>
      <div class="bg-card border rounded-[10px] px-3 py-1.5">
        <span class="text-[11px] text-muted-foreground">当年</span>
        <span class="ml-2 text-lg font-semibold"
          >{currentYearEvents.length}个节日</span
        >
      </div>
    </div>
  {/if}

  <div class="flex gap-1.5 mb-4 flex-wrap">
    {#each years as year}
      <button
        type="button"
        onclick={() => selectedYear = year}
        class="px-3 h-7 rounded-[10px] text-xs font-medium transition-colors duration-150 active:scale-[0.97] {selectedYear === year
          ? 'bg-primary text-primary-foreground'
          : 'bg-card border hover:bg-muted'}">
        {year}
      </button>
    {/each}
  </div>

  <div class="space-y-1">
    {#each currentYearEvents as event (event.uid)}
      {@const badge = getEventBadge(event)}
      <div
        class="flex items-center gap-3 py-1.5 px-3 bg-card border rounded-[8px] hover:bg-muted transition-colors duration-150">
        <div class="w-16 text-xs text-muted-foreground">
          {formatDate(event.date)}
        </div>
        <div class="w-10 text-[11px] text-muted-foreground">
          {getWeekday(event.date)}
        </div>
        <div class="flex-1 text-xs">{event.summary}</div>
        {#if badge}
          <span
            class="px-1.5 py-px text-[11px] rounded-[6px] font-medium {badge.bg} {badge.textColor}">
            {badge.text}
          </span>
        {/if}
        {#if event.description}
          <span class="text-[11px] text-muted-foreground hidden sm:inline">
            {event.description}
          </span>
        {/if}
      </div>
    {/each}
  </div>

  <footer class="mt-6 text-center text-[11px] text-muted-foreground">
    <p>数据来源: Apple iCloud 中国节假日日历 + 补充节日</p>
  </footer>
</div>
