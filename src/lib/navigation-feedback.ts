export type NavigationDestination = {
  href: string;
  label: string;
  pathname: string;
};

function getStudentDestinationLabel(pathname: string) {
  if (pathname === "/app/students/new") {
    return "Add student";
  }

  if (pathname.endsWith("/new-lesson")) {
    return "Log lesson";
  }

  if (pathname.endsWith("/schedule-lesson")) {
    return "Schedule lesson";
  }

  if (pathname.includes("/lessons/") && pathname.endsWith("/view")) {
    return "Lesson notes";
  }

  if (pathname.includes("/lessons/")) {
    return "Lesson";
  }

  if (pathname.endsWith("/edit")) {
    return "Edit student";
  }

  if (pathname === "/app/students") {
    return "Students";
  }

  return "Student";
}

export function getNavigationDestination(
  rawHref: string,
  currentHref: string,
  origin: string,
): NavigationDestination | null {
  let destination: URL;
  let current: URL;

  try {
    destination = new URL(rawHref, origin);
    current = new URL(currentHref, origin);
  } catch {
    return null;
  }

  if (
    destination.origin !== origin ||
    (destination.pathname !== "/app" && !destination.pathname.startsWith("/app/"))
  ) {
    return null;
  }

  if (
    destination.pathname === current.pathname &&
    destination.search === current.search
  ) {
    return null;
  }

  let label = "Page";

  if (destination.pathname === "/app" || destination.pathname.startsWith("/app/dashboard")) {
    label = "Dashboard";
  } else if (destination.pathname.startsWith("/app/students")) {
    label = getStudentDestinationLabel(destination.pathname);
  } else if (destination.pathname.startsWith("/app/calendar")) {
    label = "Calendar";
  } else if (destination.pathname.startsWith("/app/settings")) {
    label = "Settings";
  }

  return {
    href: `${destination.pathname}${destination.search}${destination.hash}`,
    label,
    pathname: destination.pathname,
  };
}
