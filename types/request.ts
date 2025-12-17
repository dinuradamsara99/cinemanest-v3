export interface RequestItem {
  _id: string;
  title: string;
  mediaType: "movie" | "tvshow";
  status: "new" | "in-review" | "completed" | "rejected";
  submittedAt: string;
}
