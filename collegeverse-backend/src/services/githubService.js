export const fetchGitHubActivityScore = async (username) => {
  const response = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}/events/public`);
  if (!response.ok) {
    throw new Error(`Failed to fetch GitHub activity for ${username}`);
  }
  const events = await response.json();
  const score = events.reduce((acc, event) => {
    if (["PushEvent", "PullRequestEvent", "IssuesEvent"].includes(event.type)) {
      return acc + 5;
    }
    if (event.type === "IssueCommentEvent" || event.type === "PullRequestReviewCommentEvent") {
      return acc + 2;
    }
    return acc + 1;
  }, 0);
  return { score, eventsCount: events.length };
};
