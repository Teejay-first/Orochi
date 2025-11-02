import { useState, useEffect, useRef } from "react";
import { useProvider } from "@/contexts/ProviderContext";
import { FileText, Upload, Trash2, Plus, Download, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import type { VapiFile } from "@/services/vapi/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { formatDistanceToNow } from "date-fns";

export function KnowledgeBase() {
  const { getVapiClient } = useProvider();
  const [files, setFiles] = useState<VapiFile[]>([]);
  const [knowledgeBases, setKnowledgeBases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Knowledge base creation dialog
  const [createKBDialogOpen, setCreateKBDialogOpen] = useState(false);
  const [kbName, setKbName] = useState("");
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([]);
  const [creatingKB, setCreatingKB] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    await Promise.all([loadFiles(), loadKnowledgeBases()]);
  }

  async function loadFiles() {
    try {
      setLoading(true);

      const client = getVapiClient();
      if (!client) {
        toast({
          title: "No Vapi connection",
          description: "Please connect your Vapi account in Settings",
          variant: "destructive",
        });
        return;
      }

      console.log('📁 Loading files from Vapi...');
      const data = await client.listFiles();
      console.log('✅ Loaded files:', data.length);

      setFiles(data);
    } catch (error) {
      console.error('❌ Failed to load files:', error);
      toast({
        title: "Failed to load files",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const selectedFiles = event.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    try {
      setUploading(true);

      const client = getVapiClient();
      if (!client) {
        toast({
          title: "No Vapi connection",
          description: "Please connect your Vapi account in Settings",
          variant: "destructive",
        });
        return;
      }

      // Upload each file
      const uploadPromises = Array.from(selectedFiles).map(async (file) => {
        console.log('📤 Uploading file:', file.name);
        return client.uploadFile({ file, name: file.name });
      });

      await Promise.all(uploadPromises);

      toast({
        title: "Files uploaded",
        description: `Successfully uploaded ${selectedFiles.length} file(s)`,
      });

      // Reload files
      await loadFiles();
    } catch (error) {
      console.error('❌ Failed to upload files:', error);
      toast({
        title: "Failed to upload files",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }

  async function loadKnowledgeBases() {
    try {
      const client = getVapiClient();
      if (!client) return;

      console.log('📚 Loading knowledge bases from Vapi...');
      const data = await client.listKnowledgeBases();
      console.log('✅ Loaded knowledge bases:', data.length);

      setKnowledgeBases(data);
    } catch (error) {
      console.error('❌ Failed to load knowledge bases:', error);
      toast({
        title: "Failed to load knowledge bases",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  }

  async function handleCreateKnowledgeBase() {
    if (!kbName.trim()) {
      toast({
        title: "Validation error",
        description: "Knowledge base name is required",
        variant: "destructive",
      });
      return;
    }

    try {
      setCreatingKB(true);

      const client = getVapiClient();
      if (!client) {
        toast({
          title: "No Vapi connection",
          description: "Please connect your Vapi account in Settings",
          variant: "destructive",
        });
        return;
      }

      console.log('📚 Creating knowledge base:', kbName, selectedFileIds);
      await client.createKnowledgeBase({
        name: kbName,
        fileIds: selectedFileIds.length > 0 ? selectedFileIds : undefined,
      });

      toast({
        title: "Knowledge base created",
        description: `Created ${kbName}`,
      });

      setCreateKBDialogOpen(false);
      setKbName("");
      setSelectedFileIds([]);
      await loadKnowledgeBases();
    } catch (error) {
      console.error('❌ Failed to create knowledge base:', error);
      toast({
        title: "Failed to create knowledge base",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setCreatingKB(false);
    }
  }

  async function handleDeleteKnowledgeBase(kbId: string, kbName: string) {
    try {
      const client = getVapiClient();
      if (!client) {
        toast({
          title: "No Vapi connection",
          description: "Please connect your Vapi account in Settings",
          variant: "destructive",
        });
        return;
      }

      console.log('🗑️ Deleting knowledge base:', kbId);
      await client.deleteKnowledgeBase(kbId);

      toast({
        title: "Knowledge base deleted",
        description: `Deleted ${kbName}`,
      });

      await loadKnowledgeBases();
    } catch (error) {
      console.error('❌ Failed to delete knowledge base:', error);
      toast({
        title: "Failed to delete knowledge base",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  }

  async function handleDeleteFile(fileId: string, fileName: string) {
    try {
      const client = getVapiClient();
      if (!client) {
        toast({
          title: "No Vapi connection",
          description: "Please connect your Vapi account in Settings",
          variant: "destructive",
        });
        return;
      }

      console.log('🗑️ Deleting file:', fileId);
      await client.deleteFile(fileId);

      toast({
        title: "File deleted",
        description: `Deleted ${fileName}`,
      });

      // Reload files
      await loadFiles();
    } catch (error) {
      console.error('❌ Failed to delete file:', error);
      toast({
        title: "Failed to delete file",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  }

  function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  function getFileExtension(filename: string): string {
    const ext = filename.split('.').pop()?.toUpperCase();
    return ext || 'FILE';
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading knowledge base...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <FileText className="w-6 h-6" />
            Knowledge Base
          </h1>
          <p className="text-muted-foreground mt-1">
            Upload documents and create knowledge bases for your assistants
          </p>
        </div>
        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileUpload}
            className="hidden"
            accept=".pdf,.txt,.doc,.docx,.csv,.json"
          />
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            <Upload className="w-4 h-4 mr-2" />
            {uploading ? 'Uploading...' : 'Upload Files'}
          </Button>
          <Button onClick={() => setCreateKBDialogOpen(true)}>
            <Database className="w-4 h-4 mr-2" />
            Create Knowledge Base
          </Button>
        </div>
      </div>

      {/* Knowledge Bases */}
      <Card>
        <CardHeader>
          <CardTitle>Knowledge Bases ({knowledgeBases.length})</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Knowledge bases group files together for your assistants to use
          </p>
        </CardHeader>
        <CardContent>
          {knowledgeBases.length === 0 ? (
            <div className="text-center py-8">
              <Database className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-2">No knowledge bases found</p>
              <p className="text-sm text-muted-foreground mb-4">
                Create a knowledge base to organize files for your assistants
              </p>
              <Button onClick={() => setCreateKBDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Knowledge Base
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Files</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {knowledgeBases.map((kb) => (
                  <TableRow key={kb.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Database className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{kb.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {kb.fileIds?.length || 0} files
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {kb.createdAt
                        ? formatDistanceToNow(new Date(kb.createdAt), { addSuffix: true })
                        : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteKnowledgeBase(kb.id, kb.name)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Upload Area */}
      {files.length === 0 && (
        <Card className="border-dashed border-2 border-muted-foreground/25">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Upload className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Upload Knowledge Documents</h3>
            <p className="text-sm text-muted-foreground mb-4 text-center max-w-sm">
              Upload PDFs, text files, or other documents to enhance your assistants' knowledge base.
            </p>
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              <Upload className="w-4 h-4 mr-2" />
              {uploading ? 'Uploading...' : 'Choose Files'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Files Table */}
      {files.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Uploaded Files ({files.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Uploaded</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {files.map((file) => (
                  <TableRow key={file.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{file.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {getFileExtension(file.name)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatFileSize(file.size)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {file.createdAt
                        ? formatDistanceToNow(new Date(file.createdAt), { addSuffix: true })
                        : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (file.url) {
                              window.open(file.url, '_blank');
                            }
                          }}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteFile(file.id, file.name)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>About Knowledge Base</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Upload documents to give your assistants access to specific knowledge during conversations.
          </p>
          <p className="text-sm text-muted-foreground">
            Supported formats: PDF, TXT, DOC, DOCX, CSV, JSON
          </p>
          <p className="text-sm text-muted-foreground">
            Files are processed by Vapi and made available to your assistants through retrieval augmented generation (RAG).
          </p>
        </CardContent>
      </Card>

      {/* Create Knowledge Base Dialog */}
      <Dialog open={createKBDialogOpen} onOpenChange={setCreateKBDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Knowledge Base</DialogTitle>
            <DialogDescription>
              Group files together into a knowledge base that your assistants can use
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="kbName">Name *</Label>
              <Input
                id="kbName"
                value={kbName}
                onChange={(e) => setKbName(e.target.value)}
                placeholder="Customer Support KB"
              />
            </div>

            <div>
              <Label>Select Files (optional)</Label>
              <p className="text-xs text-muted-foreground mb-3">
                Choose files to include in this knowledge base
              </p>
              {files.length === 0 ? (
                <div className="text-sm text-muted-foreground p-4 border rounded-lg">
                  No files uploaded yet. Upload files first to include them.
                </div>
              ) : (
                <div className="space-y-2 border rounded-lg p-4 max-h-64 overflow-y-auto">
                  {files.map((file) => (
                    <div key={file.id} className="flex items-center gap-2">
                      <Checkbox
                        id={`file-${file.id}`}
                        checked={selectedFileIds.includes(file.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedFileIds([...selectedFileIds, file.id]);
                          } else {
                            setSelectedFileIds(selectedFileIds.filter(id => id !== file.id));
                          }
                        }}
                      />
                      <label htmlFor={`file-${file.id}`} className="text-sm cursor-pointer flex-1">
                        {file.name}
                        <span className="text-muted-foreground ml-2">
                          ({formatFileSize(file.size)})
                        </span>
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {selectedFileIds.length > 0 && (
              <div>
                <Label>Selected Files</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  {selectedFileIds.length} file(s) selected
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedFileIds.map((fileId) => {
                    const file = files.find(f => f.id === fileId);
                    return (
                      <Badge key={fileId} variant="secondary">
                        {file?.name || fileId}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setCreateKBDialogOpen(false);
                setKbName("");
                setSelectedFileIds([]);
              }}
              disabled={creatingKB}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateKnowledgeBase} disabled={creatingKB}>
              {creatingKB ? 'Creating...' : 'Create Knowledge Base'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
