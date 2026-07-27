export type AuthenticationDraft = {
  email: string;
  password: string;
  code: string;
  error: string | null;
  message: string | null;
};

export function clearAuthenticationDraft(previous?: AuthenticationDraft): AuthenticationDraft {
  void previous;

  return {
    email: "",
    password: "",
    code: "",
    error: null,
    message: null,
  };
}
