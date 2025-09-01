"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const BASE_URL = "https://fordemo-ot4j.onrender.com"

export default function ApiInterface() {
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const [method, setMethod] = useState("GET")
  const [endpoint, setEndpoint] = useState("/users")
  const [headers, setHeaders] = useState('{\n  "Content-Type": "application/json"\n}')
  const [body, setBody] = useState('{\n  "username": "kurt",\n  "password": "1234"\n}')

  const makeApiCall = async () => {
    setLoading(true)
    setError(null)
    setResponse(null)

    try {
      let parsedHeaders = {}
      let parsedBody = null

      try {
        parsedHeaders = JSON.parse(headers)
      } catch {
        setError("Invalid JSON in headers")
        setLoading(false)
        return
      }

      if (method !== "GET" && method !== "DELETE" && body.trim()) {
        try {
          parsedBody = JSON.parse(body)
        } catch {
          setError("Invalid JSON in body")
          setLoading(false)
          return
        }
      }

      const config: RequestInit = {
        method,
        headers: parsedHeaders,
        ...(parsedBody && { body: JSON.stringify(parsedBody) }),
      }

      const url = `${BASE_URL}${endpoint}`
      const startTime = Date.now()
      const res = await fetch(url, config)
      const endTime = Date.now()

      let data
      const contentType = res.headers.get("content-type")

      try {
        if (contentType?.includes("application/json")) {
          data = await res.json()
        } else {
          data = await res.text()
        }
      } catch {
        data = "No response body"
      }

      setResponse({
        status: res.status,
        statusText: res.statusText,
        time: endTime - startTime,
        headers: Object.fromEntries(res.headers.entries()),
        data,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const setPreset = (presetType: string) => {
    switch (presetType) {
      case "createUser":
        setMethod("POST")
        setEndpoint("/users")
        setBody('{\n  "username": "kurt",\n  "password": "1234"\n}')
        break
      case "getUsers":
        setMethod("GET")
        setEndpoint("/users")
        setBody("")
        break
    }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Request</CardTitle>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setPreset("createUser")}>
                New User
              </Button>
              <Button size="sm" variant="outline" onClick={() => setPreset("getUsers")}>
                List Users
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Select value={method} onValueChange={setMethod}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GET">GET</SelectItem>
                  <SelectItem value="POST">POST</SelectItem>
                  <SelectItem value="PUT">PUT</SelectItem>
                  <SelectItem value="DELETE">DELETE</SelectItem>
                  <SelectItem value="PATCH">PATCH</SelectItem>
                </SelectContent>
              </Select>
              <Input
                placeholder="/endpoint"
                value={endpoint}
                onChange={(e) => setEndpoint(e.target.value)}
                className="flex-1"
              />
            </div>

            <Tabs defaultValue="headers" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="headers">Headers</TabsTrigger>
                <TabsTrigger value="body">Body</TabsTrigger>
              </TabsList>
              <TabsContent value="headers" className="space-y-2">
                <Label>Headers</Label>
                <Textarea
                  placeholder="JSON format"
                  value={headers}
                  onChange={(e) => setHeaders(e.target.value)}
                  rows={4}
                  className="font-mono text-sm"
                />
              </TabsContent>
              <TabsContent value="body" className="space-y-2">
                <Label>Body</Label>
                <Textarea
                  placeholder="JSON format"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={6}
                  className="font-mono text-sm"
                />
              </TabsContent>
            </Tabs>

            <Button onClick={makeApiCall} disabled={loading} className="w-full">
              {loading ? "Sending..." : "Send"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Response</CardTitle>
          </CardHeader>
          <CardContent>
            {error && <div className="text-red-600 text-sm p-3 bg-red-50 rounded border">{error}</div>}

            {response && (
              <div className="space-y-4">
                <div className="flex gap-4 text-sm">
                  <span
                    className={`font-medium ${response.status >= 200 && response.status < 300 ? "text-green-600" : "text-red-600"}`}
                  >
                    {response.status} {response.statusText}
                  </span>
                  <span className="text-gray-600">{response.time}ms</span>
                </div>

                <Tabs defaultValue="body" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="body">Body</TabsTrigger>
                    <TabsTrigger value="headers">Headers</TabsTrigger>
                  </TabsList>
                  <TabsContent value="body">
                    <pre className="text-xs bg-gray-50 p-3 rounded border overflow-auto max-h-96 font-mono">
                      {typeof response.data === "string" ? response.data : JSON.stringify(response.data, null, 2)}
                    </pre>
                  </TabsContent>
                  <TabsContent value="headers">
                    <pre className="text-xs bg-gray-50 p-3 rounded border overflow-auto max-h-96 font-mono">
                      {JSON.stringify(response.headers, null, 2)}
                    </pre>
                  </TabsContent>
                </Tabs>
              </div>
            )}

            {!response && !error && !loading && <div className="text-gray-500 text-center py-8">No response yet</div>}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
