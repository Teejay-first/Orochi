import { Phone, Plus, Settings, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";

// Mock data for phone numbers
const phoneNumbers = [
  {
    id: "1",
    number: "+1 (555) 123-4567",
    agent: "Customer Support Agent",
    status: "active",
    purchased: "2024-01-15",
    region: "US",
  },
  {
    id: "2", 
    number: "+1 (555) 987-6543",
    agent: "Sales Agent",
    status: "active",
    purchased: "2024-01-20",
    region: "US",
  },
  {
    id: "3",
    number: "+1 (555) 555-0199",
    agent: "Not assigned",
    status: "available",
    purchased: "2024-02-01",
    region: "US",
  },
];

export function PhoneNumbers() {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default">Active</Badge>;
      case 'available':
        return <Badge variant="secondary">Available</Badge>;
      case 'inactive':
        return <Badge variant="outline">Inactive</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <Phone className="w-6 h-6" />
          Phone Numbers
        </h1>
        
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Purchase Number
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Numbers</CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{phoneNumbers.length}</div>
            <p className="text-xs text-muted-foreground">
              {phoneNumbers.filter(n => n.status === 'active').length} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available</CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {phoneNumbers.filter(n => n.status === 'available').length}
            </div>
            <p className="text-xs text-muted-foreground">Ready to assign</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Cost</CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(phoneNumbers.length * 5).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">$5.00 per number</p>
          </CardContent>
        </Card>
      </div>

      {/* Phone Numbers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Managed Numbers</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Phone Number</TableHead>
                <TableHead>Assigned Agent</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Region</TableHead>
                <TableHead>Purchased</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {phoneNumbers.map((phoneNumber) => (
                <TableRow key={phoneNumber.id}>
                  <TableCell className="font-medium">
                    {phoneNumber.number}
                  </TableCell>
                  <TableCell>
                    {phoneNumber.agent === "Not assigned" ? (
                      <span className="text-muted-foreground">{phoneNumber.agent}</span>
                    ) : (
                      phoneNumber.agent
                    )}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(phoneNumber.status)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{phoneNumber.region}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(phoneNumber.purchased).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Settings className="w-4 h-4 mr-2" />
                          Configure
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Phone className="w-4 h-4 mr-2" />
                          Assign Agent
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Release
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Purchase New Number */}
      <Card>
        <CardHeader>
          <CardTitle>Purchase New Number</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Purchase additional phone numbers to expand your agent capacity. 
              Numbers can be configured to route to specific agents or pools.
            </p>
            <div className="flex items-center gap-4">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Browse Available Numbers
              </Button>
              <Button variant="outline">
                Import Existing Number
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}