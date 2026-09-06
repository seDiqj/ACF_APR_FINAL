export const DATA_TABLE_SEARCH_TIMER: number = 5000;

export const DATA_TABLE_FILTER_KEY: (url: string) => string = (url) =>
  `table_filters_${url}`;

export const DATA_TABLE_PER_PAGE_KEY: (url: string) => string = (url) =>
  `table_per_page_${url}`;

export const DATA_TABLE_ORDER_KEY: (url: string) => string = (url) =>
  `table_order_${url}`;
