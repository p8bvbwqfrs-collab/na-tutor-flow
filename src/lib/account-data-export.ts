export const ACCOUNT_DATA_EXPORT_FORMAT_VERSION = 1;
export const ACCOUNT_DATA_EXPORT_PAGE_SIZE = 500;

export const ACCOUNT_DATA_EXPORT_COLUMNS = {
  students:
    "id, student_name, subject, parent_name, parent_contact, parent_email, notes, default_fee_pence, archived_at, created_at",
  lessons:
    "id, student_id, next_lesson_id, lesson_at, topics, topic_tags, went_well, parent_note, improve, homework, effort, confidence, fee_pence, paid, status, created_at",
  payments:
    "id, student_id, amount_pence, status, payment_date, covers_from, covers_to, sessions_covered, source, note, created_at, updated_at",
  payment_allocations:
    "id, payment_id, lesson_id, amount_pence, created_at",
} as const;

export const ACCOUNT_DATA_EXPORT_SETTINGS_COLUMNS =
  "currency_code, time_zone, created_at, updated_at";

export type AccountDataExportTable = keyof typeof ACCOUNT_DATA_EXPORT_COLUMNS;
type ExportRow = Record<string, unknown>;

type ExportUser = {
  id: string;
  email: string | null;
  createdAt: string;
};

type ExportQueryResult = {
  rows: ExportRow[];
  error: string | null;
};

type ExportSettingsResult = {
  settings: ExportRow | null;
  error: string | null;
};

type AccountDataExportDependencies = {
  getAuthenticatedUser: () => Promise<ExportUser | null>;
  fetchOwnedPage: (
    table: AccountDataExportTable,
    userId: string,
    from: number,
    to: number,
  ) => Promise<ExportQueryResult>;
  fetchSettings: (userId: string) => Promise<ExportSettingsResult>;
  now?: () => Date;
};

type AccountDataExport = {
  export: {
    product: "Tutor Flow";
    format_version: number;
    generated_at: string;
  };
  account: {
    id: string;
    email: string | null;
    created_at: string;
  };
  preferences: ExportRow | null;
  students: ExportRow[];
  lessons: ExportRow[];
  payments: ExportRow[];
  payment_allocations: ExportRow[];
};

async function fetchAllOwnedRows(
  dependencies: AccountDataExportDependencies,
  table: AccountDataExportTable,
  userId: string,
) {
  const rows: ExportRow[] = [];

  for (let from = 0; ; from += ACCOUNT_DATA_EXPORT_PAGE_SIZE) {
    const result = await dependencies.fetchOwnedPage(
      table,
      userId,
      from,
      from + ACCOUNT_DATA_EXPORT_PAGE_SIZE - 1,
    );

    if (result.error) {
      return { rows: [] as ExportRow[], error: result.error };
    }

    rows.push(...result.rows);

    if (result.rows.length < ACCOUNT_DATA_EXPORT_PAGE_SIZE) {
      return { rows, error: null };
    }
  }
}

export async function createAccountDataExport(
  dependencies: AccountDataExportDependencies,
): Promise<
  | { ok: true; data: AccountDataExport }
  | { ok: false; status: 401 | 500; error: string }
> {
  const user = await dependencies.getAuthenticatedUser();

  if (!user) {
    return {
      ok: false,
      status: 401,
      error: "You need to be signed in to download your data.",
    };
  }

  const settingsResult = await dependencies.fetchSettings(user.id);

  if (settingsResult.error) {
    return {
      ok: false,
      status: 500,
      error: "We couldn’t prepare your data download. Please try again.",
    };
  }

  const exportedRows: Partial<Record<AccountDataExportTable, ExportRow[]>> = {};
  const tables = Object.keys(
    ACCOUNT_DATA_EXPORT_COLUMNS,
  ) as AccountDataExportTable[];

  for (const table of tables) {
    const result = await fetchAllOwnedRows(dependencies, table, user.id);

    if (result.error) {
      return {
        ok: false,
        status: 500,
        error: "We couldn’t prepare your data download. Please try again.",
      };
    }

    exportedRows[table] = result.rows;
  }

  return {
    ok: true,
    data: {
      export: {
        product: "Tutor Flow",
        format_version: ACCOUNT_DATA_EXPORT_FORMAT_VERSION,
        generated_at: (dependencies.now?.() ?? new Date()).toISOString(),
      },
      account: {
        id: user.id,
        email: user.email,
        created_at: user.createdAt,
      },
      preferences: settingsResult.settings,
      students: exportedRows.students ?? [],
      lessons: exportedRows.lessons ?? [],
      payments: exportedRows.payments ?? [],
      payment_allocations: exportedRows.payment_allocations ?? [],
    },
  };
}

export function serializeAccountDataExport(data: AccountDataExport) {
  return `${JSON.stringify(data, null, 2)}\n`;
}

export function accountDataExportFilename(generatedAt: string) {
  const exportDate = generatedAt.slice(0, 10);
  return `tutor-flow-data-${exportDate}.json`;
}
