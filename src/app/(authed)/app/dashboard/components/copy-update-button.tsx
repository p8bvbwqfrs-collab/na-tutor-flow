import { LessonUpdateActions } from "@/components/lesson-update-actions";

type ShareUpdateButtonProps = {
  message: string;
};

export function ShareUpdateButton({ message }: ShareUpdateButtonProps) {
  return <LessonUpdateActions message={message} reserveFeedbackSpace={false} />;
}
