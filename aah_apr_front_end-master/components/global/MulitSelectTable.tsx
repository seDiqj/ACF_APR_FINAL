"use client";

import * as React from "react";
import { useEffect, useState, useRef } from "react";
import {
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { useParentContext } from "@/contexts/ParentContext";
import {
  ChevronDown,
  Edit,
  Filter,
  Search,
  Trash,
  SlidersHorizontal,
  Layers,
  Inbox,
} from "lucide-react";
import { Can } from "../Can";
import { DeleteButtonMessage } from "@/constants/ConfirmationModelsTexts";
import {
  DELETE_BUTTON_PROVIDER_ID,
  SUBMIT_BUTTON_PROVIDER_ID,
} from "@/config/System";
import { AxiosError, AxiosResponse } from "axios";
import { DataTableInterface } from "@/interfaces/Interfaces";
import StringHelper from "@/helpers/StringHelpers/StringHelper";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MultiSelect, Option } from "../multi-select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DATA_TABLE_FILTER_KEY,
  DATA_TABLE_ORDER_KEY,
  DATA_TABLE_PER_PAGE_KEY,
  DATA_TABLE_SEARCH_TIMER,
} from "@/config/DatatableConfig";

type FiltersListType = {
  filter: string;
  type: "text" | "multiSelect";
  options?: Option[];
}[];

const DataTableDemo: React.FC<DataTableInterface> = ({
  columns,
  indexUrl,
  deleteUrl,
  searchableColumn,
  idFeildForEditStateSetter,
  editModelOpenerStateSetter,
  idFeildForShowStateSetter,
  showModelOpenerStateSetter,
  selectedRowsIdsStateSetter,
  injectedElement,
  injectedElementForOneSelectedItem,
  filtersListURL,
  deleteBtnPermission,
  editBtnPermission,
  viewPermission,
}) => {
  const {
    reqForToastAndSetMessage,
    reloadFlag,
    reqForConfirmationModelFunc,
    requestHandler,
  } = useParentContext();

  const [loading, setLoading] = useState(true);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [data, setData] = useState<any[]>([]);
  const [searchInput, setSearchInput] = useState<string>("");
  const [filters, setFilters] = useState<Record<string, string[]>>({});

  const [page, setPage] = useState(1);
  const [canNext, setCanNext] = useState<boolean>(false);
  const [canPrev, setCanPrev] = useState<boolean>(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const searchTimer = useRef<NodeJS.Timeout | null>(null);

  const TABLE_FILTER_KEY = DATA_TABLE_FILTER_KEY(indexUrl);
  const TABLE_PER_PAGE_KEY = DATA_TABLE_PER_PAGE_KEY(indexUrl);
  const TABLE_ORDER_KEY = DATA_TABLE_ORDER_KEY(indexUrl);

  const [perPage, setPerPage] = useState(
    localStorage.getItem(TABLE_PER_PAGE_KEY) ?? "10"
  );

  const [tableOrder, setTableOrder] = useState<"asc" | "desc">(
    (localStorage.getItem(TABLE_ORDER_KEY) as "asc" | "desc") ?? "desc"
  );

  const [filtersList, setFiltersList] = useState<FiltersListType>([]);

  const handleFilterChange = (field: string, value: string[]) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);
  };

  const applyFilters = () => {
    setPage(1);
    localStorage.setItem(TABLE_FILTER_KEY, JSON.stringify(filters));
    handleFetch();
    setFiltersOpen(false);
  };

  const clearFilters = () => {
    setFilters({});
    setPage(1);
    localStorage.removeItem(TABLE_FILTER_KEY);
    handleFetch();
  };

  const fetchTableData = () => {
    setLoading(true);
    requestHandler()
      .get(indexUrl)
      .then((response: AxiosResponse<any>) => {
        setData(response.data.data);
      })
      .catch((err: AxiosError<any>) => {
        reqForToastAndSetMessage(
          err.response?.data?.message || "Failed to fetch data"
        );
        if (err.response?.data.data) setData(err.response?.data.data);
      })
      .finally(() => setLoading(false));
  };

  const handleDelete = () => {
    const ids = Object.keys(rowSelection).map(Number);
    requestHandler()
      .post(deleteUrl, { ids })
      .then((res: any) => {
        reqForToastAndSetMessage(res.data.message);
        fetchTableData();
      })
      .catch((err: any) =>
        reqForToastAndSetMessage(err.response?.data?.message || "Delete failed")
      );
    setRowSelection({});
  };

  const handleSearch = () => {
    setPage(1);
    handleFetch();
  };

  const getUrl = (): string => {
    const params = new URLSearchParams();
    if (searchInput) {
      params.set("search", searchInput);
    }
    for (const key in filters) {
      if (filters[key] !== undefined && filters[key] !== null) {
        if (Array.isArray(filters[key]))
          filters[key].forEach((filter) => params.append(`${key}[]`, filter));
        else params.append(key, String(filters[key]));
      }
    }
    params.append("page", String(page));
    params.append("perPage", String(perPage));
    params.append("order", String(tableOrder));
    return `${indexUrl}?${params.toString()}`;
  };

  useEffect(() => {
    const savedFilters = localStorage.getItem(TABLE_FILTER_KEY);
    if (savedFilters) setFilters(JSON.parse(savedFilters));
  }, []);

  const handleFetch = () => {
    setLoading(true);
    requestHandler()
      .get(getUrl())
      .then((response: AxiosResponse<any>) => {
        if (response.data.data.data) {
          setData(response.data.data.data);
        } else {
          setData(response.data.data);
        }
        setCanNext(!!response.data.data.next_page_url);
        setCanPrev(!!response.data.data.prev_page_url);
        setRowSelection({});
      })
      .catch((error: AxiosError<any>) => {
        if (error.response?.data.data) setData(error.response.data.data);
        reqForToastAndSetMessage(
          error.response?.data.message || "Failed to fetch data",
          "error"
        );
      })
      .finally(() => setLoading(false));
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(handleFetch, DATA_TABLE_SEARCH_TIMER);
  };

  const onNext = () => {
    setPage((prev) => prev + 1);
    handleFetch();
  };
  const onPrev = () => {
    setPage((prev) => Math.max(1, prev - 1));
    handleFetch();
  };

  useEffect(() => {
    setPage(1);
    localStorage.setItem(TABLE_PER_PAGE_KEY, String(perPage));
    handleFetch();
  }, [perPage]);
  useEffect(() => {
    setPage(1);
    localStorage.setItem(TABLE_ORDER_KEY, String(tableOrder));
    handleFetch();
  }, [tableOrder]);

  useEffect(() => {
    if (filtersListURL) {
      requestHandler()
        .get(filtersListURL)
        .then((response: AxiosResponse<any>) =>
          setFiltersList(response.data.data)
        )
        .catch((error: AxiosError<any>) =>
          reqForToastAndSetMessage(error.response?.data.message, "error")
        );
    }
  }, []);

  useEffect(() => {
    handleFetch();
  }, [page, reloadFlag]);

  useEffect(() => {
    if (idFeildForEditStateSetter) {
      const selectedIds = Object.keys(rowSelection);
      idFeildForEditStateSetter(
        selectedIds.length === 1 ? Number(selectedIds[0]) : null
      );
    }
    if (selectedRowsIdsStateSetter) selectedRowsIdsStateSetter(rowSelection);
  }, [rowSelection]);

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getRowId: (row) => row.id.toString(),
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination: { pageSize: 20, pageIndex: 0 },
    },
  });
  return (
    <div className="w-full min-h-[420px] flex flex-col space-y-4">
      {/* Top Action Toolbar Control Group */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 bg-muted/40 p-3 rounded-lg border border-border">
        {/* Search Input Field */}
        <div className="flex items-center gap-2 max-w-sm w-full">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={`Search by ${searchableColumn}...`}
              value={searchInput}
              onChange={handleSearchInputChange}
              className="pl-9 bg-background border-input text-foreground focus-visible:ring-ring rounded-md text-sm"
              type="search"
            />
          </div>
          <Button
            variant="secondary"
            onClick={handleSearch}
            title="Search"
            className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm rounded-md px-3"
          >
            <Search className="h-4 w-4" />
          </Button>
        </div>

        {/* Dynamic Multi-Selection Contextual Actions */}
        <div className="flex flex-wrap items-center gap-2 justify-end">
          {injectedElement &&
            Object.keys(rowSelection).length >= 1 &&
            injectedElement}
          {injectedElementForOneSelectedItem &&
            Object.keys(rowSelection).length === 1 &&
            injectedElementForOneSelectedItem}

          {Object.keys(rowSelection).length === 1 &&
            editModelOpenerStateSetter && (
              <Can permission={editBtnPermission ?? "ok"}>
                <Button
                  onClick={() => editModelOpenerStateSetter(true)}
                  variant="outline"
                  size="sm"
                  className="border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground rounded-md h-9"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </Can>
            )}

          {deleteUrl && Object.keys(rowSelection).length >= 1 && (
            <Can permission={deleteBtnPermission ?? "ok"}>
              <Button
                id={DELETE_BUTTON_PROVIDER_ID}
                onClick={() => {
                  reqForConfirmationModelFunc(
                    DeleteButtonMessage,
                    handleDelete
                  );
                }}
                variant="outline"
                size="sm"
                className="border-destructive/20 bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground rounded-md h-9"
              >
                <Trash className="h-4 w-4" />
              </Button>
            </Can>
          )}
          {/* Filter Modal Dialog */}
          {filtersListURL && (
            <Dialog open={filtersOpen} onOpenChange={setFiltersOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground rounded-md h-9 gap-2"
                >
                  <Filter className="h-4 w-4 text-primary" />
                  <span>Filters</span>
                </Button>
              </DialogTrigger>

              <DialogContent className="sm:max-w-[480px] bg-card border-border text-card-foreground rounded-lg shadow-xl">
                <DialogHeader className="border-b border-border pb-3">
                  <DialogTitle className="text-lg font-bold flex items-center gap-2">
                    <SlidersHorizontal className="h-5 w-5 text-primary" />
                    Advanced Filters
                  </DialogTitle>
                </DialogHeader>

                <div className="grid gap-4 py-4 max-h-[350px] overflow-y-auto px-1">
                  {filtersList.length === 0 ? (
                    <div className="text-muted-foreground text-xs text-center py-6">
                      Loading filters...
                    </div>
                  ) : (
                    <>
                      {filtersList.map((filter, i) => (
                        <div key={i} className="flex flex-col gap-1.5">
                          <Label
                            htmlFor={filter.filter}
                            className="text-xs font-semibold text-muted-foreground"
                          >
                            {StringHelper.normalize(filter.filter)}
                          </Label>
                          {filter.type === "text" ? (
                            <Input
                              id={filter.filter}
                              name={filter.filter}
                              value={filters[filter.filter] || ""}
                              onChange={(e) =>
                                handleFilterChange(e.target.name, [
                                  e.target.value,
                                ])
                              }
                              className="bg-background border-input text-foreground focus-visible:ring-ring rounded-md text-sm h-10"
                            />
                          ) : (
                            <MultiSelect
                              options={filter.options!}
                              value={filters[filter.filter] ?? []}
                              onValueChange={(value: string[]) =>
                                handleFilterChange(filter.filter, value)
                              }
                            />
                          )}
                        </div>
                      ))}

                      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border mt-2">
                        <Button
                          id={SUBMIT_BUTTON_PROVIDER_ID}
                          onClick={applyFilters}
                          className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md h-10"
                        >
                          Apply Filters
                        </Button>
                        <Button
                          variant="secondary"
                          onClick={clearFilters}
                          className="bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-md h-10"
                        >
                          Clear All
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          )}

          {/* Column Visibility Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground rounded-md h-9 gap-2"
              >
                <Layers className="h-4 w-4 text-primary" />
                <span>Columns</span>
                <ChevronDown className="h-3.5 w-3.5 opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="bg-popover border-border text-popover-foreground rounded-md shadow-lg w-48"
            >
              {table
                .getAllColumns()
                .filter((col) => col.getCanHide())
                .map((col) => {
                  const visibleColumns = table
                    .getAllColumns()
                    .filter((c) => c.getCanHide() && c.getIsVisible());
                  return (
                    <DropdownMenuCheckboxItem
                      key={col.id}
                      className="capitalize font-medium text-xs text-foreground focus:bg-primary focus:text-primary-foreground"
                      checked={col.getIsVisible()}
                      onCheckedChange={(value) => {
                        if (value && visibleColumns.length >= 8) return;
                        col.toggleVisibility(!!value);
                      }}
                    >
                      {col.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      {/* Styled Data Grid Area */}
      <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        <Table className="border-collapse">
          <TableHeader className="bg-primary hover:bg-primary/95">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="hover:bg-transparent border-b border-border"
              >
                {headerGroup.headers.slice(0, 8).map((header) => (
                  <TableHead
                    key={header.id}
                    className="text-primary-foreground font-semibold py-3 px-4 text-xs tracking-wider"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody className="divide-y divide-border">
            {!loading &&
              table.getRowModel().rows.length >= 1 &&
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="cursor-pointer hover:bg-muted/50 transition-colors border-border"
                  onClick={(e) => {
                    const target = e.target as HTMLElement;
                    if (
                      target.closest("input[type='checkbox']") ||
                      target.closest("button") ||
                      target.closest("label") ||
                      target.closest("svg")
                    )
                      return;
                    if (idFeildForShowStateSetter)
                      idFeildForShowStateSetter(Number(row.id));
                    if (showModelOpenerStateSetter)
                      showModelOpenerStateSetter(true);
                  }}
                >
                  {row
                    .getVisibleCells()
                    .slice(0, 8)
                    .map((cell) => (
                      <TableCell
                        key={cell.id}
                        className="py-3 px-4 text-xs font-medium text-foreground whitespace-normal break-words"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                </TableRow>
              ))}
          </TableBody>
        </Table>

        {loading && (
          <div className="flex flex-col space-y-2.5 p-4 min-h-[280px] w-full bg-muted/10">
            <Skeleton className="h-9 w-full bg-muted rounded-md" />
            <Skeleton className="h-9 w-full bg-muted rounded-md" />
            <Skeleton className="h-9 w-full bg-muted rounded-md" />
            <Skeleton className="h-9 w-full bg-muted rounded-md" />
          </div>
        )}

        {!loading && table.getRowModel().rows.length === 0 && (
          <div className="flex flex-col items-center justify-center min-h-[280px] text-muted-foreground text-xs gap-2 py-10">
            <Inbox className="h-7 w-7 text-muted-foreground/60 stroke-[1.5]" />
            <span>No records found in this view dashboard.</span>
          </div>
        )}
      </div>

      {/* Footer System with Dynamic Active Theme Variables */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-border">
        <div className="text-muted-foreground text-xs font-medium">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold text-muted-foreground whitespace-nowrap">
              Rows:
            </span>
            <Select
              value={perPage as string}
              onValueChange={(value) => setPerPage(value)}
            >
              <SelectTrigger className="h-9 w-[70px] bg-background border-input text-foreground rounded-md text-xs">
                <SelectValue placeholder={perPage} />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border text-popover-foreground text-xs rounded-md">
                {["10", "25", "50", "100", "250", "500"].map((size) => (
                  <SelectItem key={size} value={size}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold text-muted-foreground whitespace-nowrap">
              Order:
            </span>
            <Select
              value={tableOrder}
              onValueChange={(value: "asc" | "desc") => setTableOrder(value)}
            >
              <SelectTrigger className="h-9 w-[110px] bg-background border-input text-foreground rounded-md text-xs">
                <SelectValue
                  placeholder={
                    tableOrder === "asc" ? "Ascending" : "Descending"
                  }
                />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border text-popover-foreground text-xs rounded-md">
                <SelectItem value="asc">Ascending</SelectItem>
                <SelectItem value="desc">Descending</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={onPrev}
              disabled={!canPrev}
              className="border-input bg-background text-foreground hover:bg-muted rounded-md h-9 px-3"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onNext}
              disabled={!canNext}
              className="border-input bg-background text-foreground hover:bg-muted rounded-md h-9 px-3"
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataTableDemo;
