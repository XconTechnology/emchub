import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Plus, Edit, Trash2, BookOpen, Eye, Calendar } from "lucide-react";
import type { Publication } from "@shared/schema";

export default function AdminPublications() {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editingPub, setEditingPub] = useState<Publication | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    author: "",
    category: "general",
    coverImage: "",
    status: "draft" as "draft" | "published",
    tags: ""
  });

  const { data: publications = [], isLoading } = useQuery<Publication[]>({
    queryKey: ['/api/admin/publications'],
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest('POST', '/api/admin/publications', data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/publications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/publications'] });
      toast({ title: "Publication created!" });
      resetForm();
    },
    onError: () => toast({ title: "Error", description: "Failed to create publication", variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await apiRequest('PATCH', `/api/admin/publications/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/publications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/publications'] });
      toast({ title: "Publication updated!" });
      resetForm();
    },
    onError: () => toast({ title: "Error", description: "Failed to update publication", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/admin/publications/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/publications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/publications'] });
      toast({ title: "Publication deleted" });
    },
    onError: () => toast({ title: "Error", description: "Failed to delete publication", variant: "destructive" }),
  });

  const resetForm = () => {
    setShowForm(false);
    setEditingPub(null);
    setFormData({ title: "", excerpt: "", content: "", author: "", category: "general", coverImage: "", status: "draft", tags: "" });
  };

  const openEdit = (pub: Publication) => {
    setEditingPub(pub);
    setFormData({
      title: pub.title,
      excerpt: pub.excerpt,
      content: pub.content,
      author: pub.author,
      category: pub.category || "general",
      coverImage: pub.coverImage || "",
      status: pub.status as "draft" | "published",
      tags: pub.tags?.join(", ") || ""
    });
    setShowForm(true);
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.excerpt || !formData.content || !formData.author) {
      toast({ title: "Missing fields", description: "Please fill in title, excerpt, content, and author", variant: "destructive" });
      return;
    }
    const payload = {
      ...formData,
      tags: formData.tags ? formData.tags.split(",").map(t => t.trim()).filter(Boolean) : [],
      coverImage: formData.coverImage || null,
    };
    if (editingPub) {
      updateMutation.mutate({ id: editingPub.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-primary" /> Publications
          </h1>
          <p className="text-muted-foreground">Manage blog posts and articles</p>
        </div>
        <Button onClick={() => { resetForm(); setShowForm(true); }} className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" /> New Publication
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-primary">{publications.length}</p>
            <p className="text-sm text-muted-foreground">Total</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-green-600">{publications.filter(p => p.status === 'published').length}</p>
            <p className="text-sm text-muted-foreground">Published</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-yellow-600">{publications.filter(p => p.status === 'draft').length}</p>
            <p className="text-sm text-muted-foreground">Drafts</p>
          </CardContent>
        </Card>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Loading...</div>
      ) : publications.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>No publications yet. Click "New Publication" to get started.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {publications.map(pub => (
            <Card key={pub.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-lg truncate">{pub.title}</h3>
                      <Badge variant={pub.status === 'published' ? 'default' : 'secondary'} className={pub.status === 'published' ? 'bg-green-100 text-green-700' : ''}>
                        {pub.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1 mb-2">{pub.excerpt}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>By {pub.author}</span>
                      {pub.category && <Badge variant="outline" className="text-xs">{pub.category}</Badge>}
                      {pub.publishedAt && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(pub.publishedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {pub.status === 'published' && (
                      <Button variant="ghost" size="sm" onClick={() => window.open(`/publications/${pub.slug}`, '_blank')}>
                        <Eye className="w-4 h-4" />
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => openEdit(pub)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700" onClick={() => {
                      if (confirm("Delete this publication?")) deleteMutation.mutate(pub.id);
                    }}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showForm} onOpenChange={(open) => { if (!open) resetForm(); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPub ? "Edit Publication" : "New Publication"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title *</label>
              <Input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="Article title" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Author *</label>
              <Input value={formData.author} onChange={e => setFormData({...formData, author: e.target.value})} placeholder="Author name" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <Input value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} placeholder="e.g., Community, News, Culture" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <Select value={formData.status} onValueChange={(v: "draft" | "published") => setFormData({...formData, status: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Cover Image URL</label>
              <Input value={formData.coverImage} onChange={e => setFormData({...formData, coverImage: e.target.value})} placeholder="https://example.com/image.jpg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Excerpt *</label>
              <Textarea value={formData.excerpt} onChange={e => setFormData({...formData, excerpt: e.target.value})} placeholder="Brief summary of the article..." rows={2} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Content *</label>
              <Textarea value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} placeholder="Full article content..." rows={10} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tags (comma separated)</label>
              <Input value={formData.tags} onChange={e => setFormData({...formData, tags: e.target.value})} placeholder="community, culture, events" />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={resetForm}>Cancel</Button>
              <Button onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending} className="bg-primary hover:bg-primary/90">
                {(createMutation.isPending || updateMutation.isPending) ? "Saving..." : editingPub ? "Update" : "Create"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
