type DataFastCookieValues = {
  visitorId?: string;
  sessionId?: string;
};

function safeCookieValue(value?: string) {
  const trimmed = value?.trim();
  if (!trimmed || trimmed.length > 200) return undefined;
  return trimmed;
}

export function dataFastCheckoutMetadata({
  visitorId,
  sessionId,
}: DataFastCookieValues) {
  const safeVisitorId = safeCookieValue(visitorId);
  const safeSessionId = safeCookieValue(sessionId);

  return {
    ...(safeVisitorId ? { datafast_visitor_id: safeVisitorId } : {}),
    ...(safeSessionId ? { datafast_session_id: safeSessionId } : {}),
  };
}
