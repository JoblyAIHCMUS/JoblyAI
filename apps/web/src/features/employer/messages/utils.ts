/**
 * Determines if two dates are different days
 */
export function isNewDate(prevDate: Date | null, currentDate: Date): boolean {
  if (!prevDate) return true;

  const prevDateOnly = new Date(prevDate);
  prevDateOnly.setHours(0, 0, 0, 0);

  const currentDateOnly = new Date(currentDate);
  currentDateOnly.setHours(0, 0, 0, 0);

  return prevDateOnly.getTime() !== currentDateOnly.getTime();
}

/**
 * Formats a date as a human-readable label for message grouping
 * Returns "Today", "Yesterday", or formatted date like "Mar 27"
 */
export function getDateLabel(date: Date): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const messageDate = new Date(date);
  messageDate.setHours(0, 0, 0, 0);

  if (messageDate.getTime() === today.getTime()) {
    return 'Today';
  }

  if (messageDate.getTime() === yesterday.getTime()) {
    return 'Yesterday';
  }

  // Format as "Mar 27"
  return messageDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Standardizes the sender avatar logic across the application.
 */
export function getSenderAvatar(
  msgAvatar: string | undefined | null,
  senderId: string,
  currentUserId: string,
  conversationAvatar: string | undefined | null
): string {
  // If we have a specific avatar for this message, use it
  if (msgAvatar) return msgAvatar;

  // Fallback based on who sent the message
  if (senderId === currentUserId) {
    return 'https://placehold.co/40x40'; // Fallback for current user
  }

  // Fallback for the participant
  return conversationAvatar || 'https://placehold.co/40x40';
}
