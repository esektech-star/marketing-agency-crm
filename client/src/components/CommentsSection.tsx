import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Edit2, Reply, Heart } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";

interface Comment {
  id: string;
  author: string;
  avatar: string;
  content: string;
  timestamp: Date;
  likes: number;
  replies: Comment[];
  mentions: string[];
}

interface CommentsSectionProps {
  entityId: string;
  entityType: "task" | "campaign" | "client";
  currentUser: string;
  currentUserAvatar: string;
}

export default function CommentsSection({
  entityId,
  entityType,
  currentUser,
  currentUserAvatar,
}: CommentsSectionProps) {
  const { t, i18n } = useTranslation();
  const [comments, setComments] = useState<Comment[]>([
    {
      id: "1",
      author: "أحمد محمد",
      avatar: "AM",
      content: "تم إكمال المرحلة الأولى من الحملة بنجاح ✅",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      likes: 3,
      replies: [
        {
          id: "1-1",
          author: "فاطمة علي",
          avatar: "FA",
          content: "@أحمد محمد رائع! هل يمكن البدء بالمرحلة الثانية؟",
          timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
          likes: 1,
          replies: [],
          mentions: ["أحمد محمد"],
        },
      ],
      mentions: [],
    },
    {
      id: "2",
      author: "محمود حسن",
      avatar: "MH",
      content: "الميزانية تحتاج إلى مراجعة للربع القادم",
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      likes: 2,
      replies: [],
      mentions: [],
    },
  ]);

  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [mentionSuggestions, setMentionSuggestions] = useState<string[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Mock team members for mentions
  const teamMembers = ["أحمد محمد", "فاطمة علي", "محمود حسن", "سارة إبراهيم", "علي محمد"];

  // Handle @ mentions
  useEffect(() => {
    const lastAtIndex = newComment.lastIndexOf("@");
    if (lastAtIndex !== -1) {
      const searchText = newComment.substring(lastAtIndex + 1).toLowerCase();
      const suggestions = teamMembers.filter((member) =>
        member.toLowerCase().includes(searchText)
      );
      setMentionSuggestions(suggestions);
    } else {
      setMentionSuggestions([]);
    }
  }, [newComment]);

  const handleAddComment = () => {
    if (newComment.trim()) {
      const mentions = newComment.match(/@[\u0600-\u06FF\s]+/g) || [];
      const newCommentObj: Comment = {
        id: Date.now().toString(),
        author: currentUser,
        avatar: currentUserAvatar,
        content: newComment,
        timestamp: new Date(),
        likes: 0,
        replies: [],
        mentions: mentions.map((m) => m.replace("@", "")),
      };

      if (replyingTo) {
        // Add as reply
        const addReplyToComment = (comments: Comment[]): Comment[] => {
          return comments.map((comment) => {
            if (comment.id === replyingTo) {
              return { ...comment, replies: [...comment.replies, newCommentObj] };
            }
            return {
              ...comment,
              replies: addReplyToComment(comment.replies),
            };
          });
        };
        setComments(addReplyToComment(comments));
        setReplyingTo(null);
      } else {
        setComments([newCommentObj, ...comments]);
      }

      setNewComment("");
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }
  };

  const handleDeleteComment = (id: string) => {
    const deleteCommentRecursive = (comments: Comment[]): Comment[] => {
      return comments
        .filter((comment) => comment.id !== id)
        .map((comment) => ({
          ...comment,
          replies: deleteCommentRecursive(comment.replies),
        }));
    };
    setComments(deleteCommentRecursive(comments));
  };

  const handleMentionClick = (member: string) => {
    const lastAtIndex = newComment.lastIndexOf("@");
    const beforeMention = newComment.substring(0, lastAtIndex);
    setNewComment(`${beforeMention}@${member} `);
    setMentionSuggestions([]);
  };

  const renderComment = (comment: Comment, isReply = false) => (
    <div key={comment.id} className={`${isReply ? "ml-8 mt-4" : "mb-4"}`}>
      <Card className="p-4">
        <div className="flex gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-blue-600 text-white text-xs">
              {comment.avatar}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-sm">{comment.author}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(comment.timestamp, {
                    addSuffix: true,
                    locale: i18n.language === "ar" ? ar : undefined,
                  })}
                </p>
              </div>

              {comment.author === currentUser && (
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditingId(comment.id);
                      setEditText(comment.content);
                    }}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteComment(comment.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>

            {/* Mentions */}
            {comment.mentions.length > 0 && (
              <div className="flex gap-1 mt-2 flex-wrap">
                {comment.mentions.map((mention) => (
                  <Badge key={mention} variant="secondary" className="text-xs">
                    @{mention}
                  </Badge>
                ))}
              </div>
            )}

            {/* Comment Content */}
            {editingId === comment.id ? (
              <div className="mt-2 space-y-2">
                <Textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="text-sm"
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => {
                      // Update comment
                      setEditingId(null);
                    }}
                  >
                    {t("common.save", "Save")}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditingId(null)}
                  >
                    {t("common.cancel", "Cancel")}
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-sm mt-2">{comment.content}</p>
            )}

            {/* Actions */}
            <div className="flex gap-3 mt-3">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs"
                onClick={() => setReplyingTo(comment.id)}
              >
                <Reply className="w-3 h-3 ml-1" />
                {t("common.reply", "Reply")}
              </Button>
              <Button variant="ghost" size="sm" className="text-xs">
                <Heart className="w-3 h-3 ml-1" />
                {comment.likes > 0 ? comment.likes : ""}
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Replies */}
      {comment.replies.map((reply) => renderComment(reply, true))}
    </div>
  );

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">{t("comments.title", "Comments")}</h3>

      {/* New Comment Input */}
      <Card className="p-4">
        <div className="flex gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-green-600 text-white text-xs">
              {currentUserAvatar}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-2">
            <Textarea
              ref={textareaRef}
              placeholder={t("comments.placeholder", "Add a comment... (use @ to mention)")}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="text-sm"
              rows={3}
            />

            {/* Mention Suggestions */}
            {mentionSuggestions.length > 0 && (
              <div className="bg-muted p-2 rounded space-y-1">
                {mentionSuggestions.map((member) => (
                  <button
                    key={member}
                    onClick={() => handleMentionClick(member)}
                    className="block w-full text-left text-sm p-1 hover:bg-background rounded"
                  >
                    @{member}
                  </button>
                ))}
              </div>
            )}

            <div className="flex justify-end gap-2">
              {replyingTo && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setReplyingTo(null);
                    setNewComment("");
                  }}
                >
                  {t("common.cancel", "Cancel")}
                </Button>
              )}
              <Button
                size="sm"
                onClick={handleAddComment}
                disabled={!newComment.trim()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {replyingTo ? t("common.reply", "Reply") : t("common.comment", "Comment")}
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Comments List */}
      <div className="space-y-2">
        {comments.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            {t("comments.noComments", "No comments yet. Be the first to comment!")}
          </p>
        ) : (
          comments.map((comment) => renderComment(comment))
        )}
      </div>
    </div>
  );
}
