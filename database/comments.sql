-- Comments table
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  movie_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES "User"(id) ON DELETE CASCADE
);

-- Comment votes table (for likes/dislikes)
CREATE TABLE IF NOT EXISTS comment_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('like', 'dislike')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES "User"(id) ON DELETE CASCADE,
  UNIQUE(comment_id, user_id)
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_comments_movie_id ON comments(movie_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comment_votes_comment_id ON comment_votes(comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_votes_user_id ON comment_votes(user_id);

-- Function to get comment with vote counts
CREATE OR REPLACE FUNCTION get_comment_with_votes(comment_uuid UUID, current_user_id TEXT DEFAULT NULL)
RETURNS TABLE (
  id UUID,
  movie_id TEXT,
  user_id TEXT,
  parent_id UUID,
  content TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  likes BIGINT,
  dislikes BIGINT,
  user_liked BOOLEAN,
  user_disliked BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.movie_id,
    c.user_id,
    c.parent_id,
    c.content,
    c.created_at,
    c.updated_at,
    COUNT(CASE WHEN cv.vote_type = 'like' THEN 1 END) AS likes,
    COUNT(CASE WHEN cv.vote_type = 'dislike' THEN 1 END) AS dislikes,
    BOOL_OR(cv.user_id = current_user_id AND cv.vote_type = 'like') AS user_liked,
    BOOL_OR(cv.user_id = current_user_id AND cv.vote_type = 'dislike') AS user_disliked
  FROM comments c
  LEFT JOIN comment_votes cv ON c.id = cv.comment_id
  WHERE c.id = comment_uuid
  GROUP BY c.id;
END;
$$ LANGUAGE plpgsql;
