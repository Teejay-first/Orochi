import { FileText, Upload, Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function KnowledgeBase() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <FileText className="w-6 h-6" />
          Knowledge Base
        </h1>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search documents..."
              className="w-64 pl-9"
            />
          </div>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Document
          </Button>
        </div>
      </div>

      {/* Upload Area */}
      <Card className="border-dashed border-2 border-muted-foreground/25">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Upload className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Upload Knowledge Documents</h3>
          <p className="text-sm text-muted-foreground mb-4 text-center max-w-sm">
            Upload PDFs, text files, or other documents to enhance your agents' knowledge base.
          </p>
          <Button>
            <Upload className="w-4 h-4 mr-2" />
            Choose Files
          </Button>
        </CardContent>
      </Card>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Example documents */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-muted-foreground" />
                <div>
                  <CardTitle className="text-base">Product Manual</CardTitle>
                  <p className="text-sm text-muted-foreground">Updated 2 days ago</p>
                </div>
              </div>
              <Badge variant="secondary">PDF</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Comprehensive product documentation and user guides.
            </p>
            <div className="flex items-center justify-between mt-4">
              <span className="text-xs text-muted-foreground">2.4 MB</span>
              <Button variant="ghost" size="sm">Edit</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-muted-foreground" />
                <div>
                  <CardTitle className="text-base">FAQ Database</CardTitle>
                  <p className="text-sm text-muted-foreground">Updated 5 days ago</p>
                </div>
              </div>
              <Badge variant="secondary">TXT</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Frequently asked questions and their answers.
            </p>
            <div className="flex items-center justify-between mt-4">
              <span className="text-xs text-muted-foreground">156 KB</span>
              <Button variant="ghost" size="sm">Edit</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-muted-foreground" />
                <div>
                  <CardTitle className="text-base">Company Policies</CardTitle>
                  <p className="text-sm text-muted-foreground">Updated 1 week ago</p>
                </div>
              </div>
              <Badge variant="secondary">PDF</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Internal policies and procedures documentation.
            </p>
            <div className="flex items-center justify-between mt-4">
              <span className="text-xs text-muted-foreground">1.8 MB</span>
              <Button variant="ghost" size="sm">Edit</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Empty State when no documents */}
      <div className="text-center py-12 text-muted-foreground">
        <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
        <h3 className="text-lg font-medium mb-2">No documents uploaded yet</h3>
        <p className="text-sm mb-4">
          Start building your knowledge base by uploading relevant documents.
        </p>
      </div>
    </div>
  );
}