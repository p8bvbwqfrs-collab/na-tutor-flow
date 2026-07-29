export const ACCOUNT_DELETION_SUCCESS_PATH = "/login?account_deleted=1";

export type AccountDeletionUser = {
  id: string;
  email: string | null;
};

export type AccountDeletionDependencies = {
  getAuthenticatedUser: () => Promise<AccountDeletionUser | null>;
  deleteAuthenticatedUser: (userId: string) => Promise<{ error: string | null }>;
};

export type AccountDeletionResult =
  | { ok: true }
  | { ok: false; status: 400 | 401 | 500; error: string };

export async function deleteAuthenticatedAccount(
  dependencies: AccountDeletionDependencies,
  confirmationEmail: string,
): Promise<AccountDeletionResult> {
  const user = await dependencies.getAuthenticatedUser();

  if (!user) {
    return {
      ok: false,
      status: 401,
      error: "You need to be signed in to delete your account.",
    };
  }

  if (!user.email) {
    return {
      ok: false,
      status: 400,
      error: "This account has no email address to confirm. Please contact support.",
    };
  }

  if (confirmationEmail !== user.email) {
    return {
      ok: false,
      status: 400,
      error: `Type ${user.email} exactly to confirm account deletion.`,
    };
  }

  const deletion = await dependencies.deleteAuthenticatedUser(user.id);

  if (deletion.error) {
    return {
      ok: false,
      status: 500,
      error: "Your account could not be deleted. Nothing was recorded as successful.",
    };
  }

  return { ok: true };
}

type AccountDeletionSubmission = {
  inFlight: { current: boolean };
  deleteAccount: () => Promise<AccountDeletionResult>;
  navigate: (path: string) => void;
};

export type AccountDeletionSubmissionResult =
  | { status: "success" }
  | { status: "error"; error: string }
  | { status: "duplicate" };

export async function submitAccountDeletion({
  inFlight,
  deleteAccount,
  navigate,
}: AccountDeletionSubmission): Promise<AccountDeletionSubmissionResult> {
  if (inFlight.current) {
    return { status: "duplicate" };
  }

  inFlight.current = true;

  try {
    const result = await deleteAccount();

    if (!result.ok) {
      inFlight.current = false;
      return { status: "error", error: result.error };
    }

    navigate(ACCOUNT_DELETION_SUCCESS_PATH);
    return { status: "success" };
  } catch {
    inFlight.current = false;
    return {
      status: "error",
      error: "Your account could not be deleted. Please try again.",
    };
  }
}
