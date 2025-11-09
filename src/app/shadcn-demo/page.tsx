'use client';

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function ShadcnDemo() {
  return (
    <div className="container mx-auto p-8 space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2">ShadCN UI Integration Demo</h1>
        <p className="text-muted-foreground">
          This page demonstrates the ShadCN UI components integrated into the School Management System.
        </p>
      </div>

      {/* Buttons */}
      <Card>
        <CardHeader>
          <CardTitle>Buttons</CardTitle>
          <CardDescription>Various button styles and variants</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <Button>Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
          <Button variant="amrita">Amrita Brand</Button>
        </CardContent>
      </Card>

      {/* Form Inputs */}
      <Card>
        <CardHeader>
          <CardTitle>Form Components</CardTitle>
          <CardDescription>Input fields, labels, and selects</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" placeholder="Enter your name" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="your.email@example.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="class">Class</Label>
            <Select>
              <SelectTrigger id="class">
                <SelectValue placeholder="Select a class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lkg">LKG</SelectItem>
                <SelectItem value="ukg">UKG</SelectItem>
                <SelectItem value="1">Class 1</SelectItem>
                <SelectItem value="2">Class 2</SelectItem>
                <SelectItem value="3">Class 3</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="amrita">Submit Form</Button>
        </CardFooter>
      </Card>

      {/* Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Tabs Component</CardTitle>
          <CardDescription>Organize content with tabs</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" className="w-full">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            <TabsContent value="overview">
              <p className="text-sm text-muted-foreground">
                This is the overview tab content. ShadCN UI provides beautiful, accessible components.
              </p>
            </TabsContent>
            <TabsContent value="details">
              <p className="text-sm text-muted-foreground">
                Details tab showing additional information about the system.
              </p>
            </TabsContent>
            <TabsContent value="settings">
              <p className="text-sm text-muted-foreground">
                Settings and configuration options would appear here.
              </p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Cards Grid */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Card Layouts</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Students</CardTitle>
              <CardDescription>Total enrolled students</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">1,234</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Teachers</CardTitle>
              <CardDescription>Faculty members</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">89</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Classes</CardTitle>
              <CardDescription>Active classes</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">45</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
