"use client"

import type React from "react"
import Image from "next/image"

import { useState, useCallback, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Upload,
  FileText,
  AlertCircle,
  CheckCircle2,
  Clock,
  X,
  Search,
  MessageSquare,
  BarChart3,
  FileCheck,
  Send,
} from "lucide-react"
import { api, Document, QueryRequest, QueryResponse } from "@/lib/api"
import FileUpload from "@/components/FileUpload"
import "./globals.css"

type FileStatus = "idle" | "uploading" | "processing" | "processed" | "error"
type Domain = "auto-detect" | "insurance" | "legal" | "hr" | "compliance"
type Priority = "low" | "normal" | "high" | "urgent"

interface UploadedFile {
  id?: string
  file: File
  status: FileStatus
  progress: number
  domain: Domain
  priority: Priority
  error?: string
  clause?: string
  filename?: string
  document_type?: string
  created_at?: string
}

interface ChatMessage {
  id: string
  type: "user" | "assistant"
  content: string
  timestamp: Date
}

const SUPPORTED_FORMATS = ["pdf", "docx", "doc", "eml", "msg"]
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

const DOMAIN_KEYWORDS = {
  insurance: ["policy", "claim", "premium", "coverage", "deductible"],
  legal: ["contract", "agreement", "terms", "legal", "lawsuit"],
  hr: ["employee", "payroll", "benefits", "hiring", "performance"],
  compliance: ["audit", "regulation", "compliance", "risk", "policy"],
}

const SAMPLE_CLAUSES = {
  insurance: "The insured shall notify the company within 30 days of any claim or potential claim under this policy.",
  legal: "This agreement shall be governed by and construed in accordance with the laws of the jurisdiction.",
  hr: "Employee benefits include health insurance, retirement plans, and paid time off as outlined in the employee handbook.",
  compliance:
    "All transactions must comply with applicable anti-money laundering regulations and reporting requirements.",
}

// No hardcoded responses - all responses will come from the AI

export default function DashboardComponent({ onBackToHome }: { onBackToHome: () => void }) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      type: "assistant",
      content: "Hello! I'm your AI assistant. Upload some documents and ask me questions about them.",
      timestamp: new Date(),
    },
  ])
  
  // Function to format AI responses in a natural, conversational way
  const formatAIResponse = (response: QueryResponse): string => {
    // If we have a decision/response, return it directly
    if (response.decision && response.decision !== "Information Available") {
      return response.decision;
    }
    
    // If we have a justification, return that
    if (response.justification) {
      return response.justification;
    }
    
    // Default fallback if no response is available
    return "I've processed your request. How can I assist you further?";
  }
  const [currentMessage, setCurrentMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedDocument, setSelectedDocument] = useState<string>("all")
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Fetch existing documents and queries on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        
        // Fetch documents
        const documents = await api.getDocuments()
        
        // Convert API documents to UploadedFile format
        const files = documents.map(doc => {
          // Create a File object (this is a simplified version since we can't recreate the actual file)
          const dummyFile = new File([""], doc.filename, { type: "application/octet-stream" })
          
          return {
            id: doc.id,
            file: dummyFile,
            filename: doc.filename,
            document_type: doc.document_type,
            created_at: doc.created_at,
            status: doc.status as FileStatus,
            progress: 100,
            domain: doc.document_type as Domain,
            priority: "normal" as Priority,
          }
        })
        
        setUploadedFiles(files)
        
        // Fetch recent queries
        const queries = await api.getQueries()
        
        if (queries.length > 0) {
          // Add the most recent query and response to chat history
          const recentQueries = queries.slice(-3).reverse() // Get last 3 queries in reverse order (newest first)
          
          const newMessages = recentQueries.flatMap(query => [
            {
              id: `user-${query.id}`,
              type: "user" as const,
              content: query.query,
              timestamp: new Date(query.created_at),
            },
            {
              id: query.id,
              type: "assistant" as const,
              content: formatAIResponse(query),
              timestamp: new Date(query.created_at),
            }
          ])
          
          setChatMessages(prev => [
            prev[0], // Keep the welcome message
            ...newMessages
          ])
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchData()
  }, [])

  const detectDomain = useCallback((filename: string): Domain => {
    const lowerFilename = filename.toLowerCase();
    for (const [domain, keywords] of Object.entries(DOMAIN_KEYWORDS)) {
      if (keywords.some((keyword) => lowerFilename.includes(keyword))) {
        return domain as Domain;
      }
    }
    return "auto-detect";
  }, []);
  const validateFile = useCallback((file: File): string | null => {
    const extension = file.name.split(".").pop()?.toLowerCase();
    if (!extension || !SUPPORTED_FORMATS.includes(extension)) {
      return `Unsupported file format. Please upload ${SUPPORTED_FORMATS.join(", ").toUpperCase()} files only.`;
    }
    if (file.size > MAX_FILE_SIZE) {
      return "File size exceeds 10MB limit. Please choose a smaller file.";
    }
    return null;
  }, []);

  const uploadFileDirectly = useCallback(async (file: File, index: number, document_type: string) => {
    console.log('Starting direct upload for file:', file.name, 'at index:', index);
    try {
      setUploadedFiles(prev => 
        prev.map((f, i) => 
          i === index ? { ...f, status: 'uploading' as FileStatus, progress: 10 } : f
        )
      );
      setUploadedFiles(prev => 
        prev.map((f, i) => 
          i === index ? { ...f, status: 'processing' as FileStatus, progress: 50 } : f
        )
      );
      console.log('Calling API upload for:', file.name);
      const result = await api.uploadDocument(file, document_type);
      console.log('Upload result:', result);
      const detectedDomain = detectDomain(file.name);
      const clause = detectedDomain !== "auto-detect" && SAMPLE_CLAUSES[detectedDomain as keyof typeof SAMPLE_CLAUSES] ? 
        SAMPLE_CLAUSES[detectedDomain as keyof typeof SAMPLE_CLAUSES] : 
        undefined;
      setUploadedFiles(prev => 
        prev.map((f, i) => {
          if (i === index) {
            return {
              ...f,
              id: result.id || file.name,
              filename: result.filename || file.name,
              document_type: result.document_type || document_type,
              created_at: result.created_at || new Date().toISOString(),
              status: "processed" as FileStatus,
              progress: 100,
              domain: detectedDomain,
              clause,
              error: undefined
            };
          }
          return f;
        })
      );
    } catch (error) {
      console.error('Upload error:', error);
      setUploadedFiles(prev => 
        prev.map((f, i) => {
          if (i === index) {
            return {
              ...f,
              status: "error" as FileStatus,
              error: error instanceof Error ? error.message : "Failed to upload document"
            };
          }
          return f;
        })
      );
    }
  }, [detectDomain]);

  const handleFiles = useCallback((files: FileList) => {
    Array.from(files).forEach((file) => {
      const error = validateFile(file);
      if (error) {
        const errorFile: UploadedFile = {
          file,
          status: "error",
          progress: 0,
          domain: "auto-detect",
          priority: "normal",
          error,
        };
        setUploadedFiles((prev) => [...prev, errorFile]);
        return;
      }
      const newFile: UploadedFile = {
        file,
        status: "idle",
        progress: 0,
        domain: "auto-detect",
        priority: "normal",
      };
      setUploadedFiles((prev) => {
        const newFiles = [...prev, newFile];
        const newIndex = newFiles.length - 1;
        uploadFileDirectly(file, newIndex, "policy");
        return newFiles;
      });
    });
  }, [validateFile, uploadFileDirectly]);


  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    handleFiles(e.dataTransfer.files)
  }, [handleFiles])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files)
    }
  }

  const updateFileDomain = (index: number, domain: Domain) => {
    setUploadedFiles((prev) => prev.map((f, i) => (i === index ? { ...f, domain } : f)))
  }

  const updateFilePriority = (index: number, priority: Priority) => {
    setUploadedFiles((prev) => prev.map((f, i) => (i === index ? { ...f, priority } : f)))
  }

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSendMessage = async () => {
    if (!currentMessage.trim()) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: "user",
      content: currentMessage,
      timestamp: new Date(),
    }

    setChatMessages((prev) => [...prev, userMessage])
    setCurrentMessage("")
    setIsTyping(true)

    try {
      // Get the selected document details if a specific document is selected
      let documentContext = "\nAvailable documents in context:\n";
      
      if (selectedDocument !== "all") {
        const selectedDoc = uploadedFiles.find(f => f.id === selectedDocument);
        if (selectedDoc) {
          documentContext = `Current document: ${selectedDoc.filename || selectedDoc.file.name}\n`;
          // Add any relevant document metadata to the context
          if (selectedDoc.document_type) {
            documentContext += `Document type: ${selectedDoc.document_type}\n`;
          }
          if (selectedDoc.created_at) {
            documentContext += `Uploaded: ${new Date(selectedDoc.created_at).toLocaleDateString()}\n`;
          }
        }
      } else {
        // If 'all' is selected, list all processed documents
        const processedDocs = uploadedFiles.filter(f => f.status === "processed");
        if (processedDocs.length > 0) {
          documentContext += processedDocs
            .map(doc => `- ${doc.filename || doc.file.name}${doc.document_type ? ` (${doc.document_type})` : ''}`)
            .join('\n');
        } else {
          documentContext += "No documents available. Please upload documents first.";
        }
      }
      
      // Prepare the query with document context
      const queryWithContext = `${userMessage.content}\n\n${documentContext}`;
      
      // Log the selected document for debugging
      if (selectedDocument !== "all") {
        const selectedDoc = uploadedFiles.find(f => 
          (f.id === selectedDocument) || 
          (f.filename === selectedDocument) || 
          (f.file.name === selectedDocument)
        );
        console.log('Selected document:', selectedDoc);
      } else {
        console.log('Querying all documents');
      }
      
      // Process query using API with document selection and context
      const queryRequest: QueryRequest = {
        query: queryWithContext,
        // Include document filter if a specific document is selected
        ...(selectedDocument !== "all" && { 
          document_id: selectedDocument 
        })
      };
      
      console.log('Sending query with context:', queryRequest);
      const response = await api.processQuery(queryRequest);
      console.log('API Response:', response);
      
      // Create assistant message from API response with natural formatting
      const assistantMessage: ChatMessage = {
        id: response.id,
        type: "assistant",
        content: formatAIResponse(response),
        timestamp: new Date(),
      }
      
      setChatMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      // Handle error
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : "Unknown error"}`,
        timestamp: new Date(),
      }
      setChatMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsTyping(false)
    }
  }

  const getStatusIcon = (status: FileStatus) => {
    switch (status) {
      case "uploading":
        return <Upload className="h-4 w-4 animate-pulse text-blue-500" />
      case "processing":
        return <Clock className="h-4 w-4 animate-spin text-yellow-500" />
      case "processed":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <FileText className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusText = (status: FileStatus) => {
    switch (status) {
      case "uploading":
        return "Uploading..."
      case "processing":
        return "Processing..."
      case "processed":
        return "Processed"
      case "error":
        return "Error"
      default:
        return "Ready"
    }
  }

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800 border-red-200"
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "normal":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "low":
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Mobile First */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
          <div className="flex justify-between items-center h-14 sm:h-16">
            {/* Logo and Brand */}
            <div className="flex items-center">
              <div className="flex items-center space-x-2 sm:space-x-4">
                <div className="relative">
                  <Image 
                    src="/logo.png" 
                    alt="Policy Brain Logo"
                    width={80}
                    height={80}
                    className="object-contain object-center h-20 w-20" 
                    priority
                    quality={100}
                  />
                </div>
                <span className="text-xl sm:text-2xl md:text-3xl font-black text-gray-800 tracking-tight">
                  POLICY BRAIN
                </span>
              </div>
            </div>
            
            {/* Navigation - Hidden on mobile, shown on md and up */}
            <nav className="hidden md:flex space-x-1 sm:space-x-2 md:space-x-4">
              <Button
                variant="ghost"
                size="sm"
                className="text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                onClick={onBackToHome}
              >
                Home
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                className="text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50"
              >
                Sign In
              </Button>
            </nav>
            
            {/* Mobile Menu Button */}
            <Button 
              variant="ghost" 
              size="icon"
              className="md:hidden"
              onClick={onBackToHome}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </Button>
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 py-3 sm:py-4">
        <div className="mb-4 sm:mb-6 md:mb-8 text-center px-2">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 sm:mb-3">
            Bajaj Policy Brain
          </h1>
          <p className="text-sm sm:text-base text-gray-600">Upload documents and interact with your AI assistant</p>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative w-16 h-16">
                <div className="w-16 h-16 rounded-full border-4 border-gray-200"></div>
                <div className="w-16 h-16 rounded-full border-4 border-t-blue-600 animate-spin absolute top-0 left-0"></div>
              </div>
              <p className="text-gray-600 text-lg">Loading your documents and queries...</p>
            </div>
          </div>
        ) : (
          <Tabs defaultValue="upload" className="space-y-4 sm:space-y-6">
            {/* Tabs Navigation */}
            <div className="overflow-x-auto pb-1 sm:pb-0">
              <TabsList className="w-full grid grid-cols-3 gap-1 sm:gap-2 p-1 bg-gray-100 rounded-lg">
                <TabsTrigger 
                  value="upload" 
                  className="flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm px-2 py-1.5 sm:px-4 sm:py-2 whitespace-nowrap"
                >
                  <Upload className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                  <span className="truncate">Upload</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="chat" 
                  className="flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm px-2 py-1.5 sm:px-4 sm:py-2 whitespace-nowrap"
                >
                  <MessageSquare className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                  <span className="truncate">AI Assistant</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="analytics" 
                  className="flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm px-2 py-1.5 sm:px-4 sm:py-2 whitespace-nowrap"
                >
                  <BarChart3 className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                  <span className="truncate">Analytics</span>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Upload Tab Content */}
            <TabsContent value="upload" className="space-y-4 sm:space-y-6">
              <Card className="border-2 border-dashed border-gray-200 hover:border-blue-300 transition-colors max-w-3xl mx-auto">
                <CardHeader className="text-center p-4 sm:p-6">
                  <CardTitle className="flex flex-col items-center justify-center gap-2 text-xl sm:text-2xl">
                    <div className="p-2 bg-blue-50 rounded-full">
                      <Upload className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                    </div>
                    <span>Upload Documents</span>
                  </CardTitle>
                  <CardDescription className="text-sm sm:text-base mt-2 text-gray-600">
                    Drag and drop files here or click to browse
                  </CardDescription>
                </CardHeader>
              <CardContent>
                <div
                  className={`relative border-2 border-dashed rounded-lg p-12 text-center transition-all duration-200 ${
                    isDragOver
                      ? "border-blue-400 bg-blue-50 scale-[1.02]"
                      : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                  }`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.docx,.doc,.eml,.msg"
                    onChange={handleFileInput}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="space-y-6">
                    <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                      <Upload className="h-8 w-8 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-semibold text-gray-900 mb-2">Drop your files here</p>
                      <p className="text-lg text-gray-500">or click to browse from your computer</p>
                    </div>
                    <Button
                      size="lg"
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-blue-600 hover:bg-blue-700 px-8 py-3 text-lg"
                    >
                      Choose Files
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Supported Formats */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-wrap items-center justify-center gap-6">
                  <span className="text-lg font-medium text-gray-700">Supported formats:</span>
                  <div className="flex flex-wrap gap-3">
                    {SUPPORTED_FORMATS.map((format) => (
                      <Badge key={format} variant="secondary" className="uppercase text-sm px-3 py-1">
                        {format}
                      </Badge>
                    ))}
                  </div>
                  <span className="text-lg text-gray-500">• Max 10MB per file</span>
                </div>
              </CardContent>
            </Card>

            {/* Uploaded Files */}
            {uploadedFiles.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Uploaded Files ({uploadedFiles.length})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {uploadedFiles.map((uploadedFile, index) => (
                    <div key={index} className="border rounded-lg p-6 space-y-4 bg-white shadow-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          {getStatusIcon(uploadedFile.status)}
                          <div>
                            <p className="font-semibold text-gray-900 text-lg">{uploadedFile.file.name}</p>
                            <p className="text-gray-500">
                              {(uploadedFile.file.size / 1024 / 1024).toFixed(2)} MB •{" "}
                              {getStatusText(uploadedFile.status)}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <X className="h-5 w-5" />
                        </Button>
                      </div>

                      {uploadedFile.status === "uploading" && (
                        <Progress value={uploadedFile.progress} className="w-full h-3" />
                      )}

                      {uploadedFile.status === "error" && uploadedFile.error && (
                        <Alert variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription className="text-base">{uploadedFile.error}</AlertDescription>
                        </Alert>
                      )}

                      {(uploadedFile.status === "processed" || uploadedFile.status === "processing") && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="text-base font-medium text-gray-700 mb-3 block">
                              Domain Classification
                            </label>
                            <Select
                              value={uploadedFile.domain}
                              onValueChange={(value: Domain) => updateFileDomain(index, value)}
                              disabled={uploadedFile.status === "processing"}
                            >
                              <SelectTrigger className="h-12">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="auto-detect">Auto-detect</SelectItem>
                                <SelectItem value="insurance">Insurance</SelectItem>
                                <SelectItem value="legal">Legal</SelectItem>
                                <SelectItem value="hr">HR</SelectItem>
                                <SelectItem value="compliance">Compliance</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <label className="text-base font-medium text-gray-700 mb-3 block">
                              Processing Priority
                            </label>
                            <Select
                              value={uploadedFile.priority}
                              onValueChange={(value: Priority) => updateFilePriority(index, value)}
                              disabled={uploadedFile.status === "processing"}
                            >
                              <SelectTrigger className="h-12">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="normal">Normal</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                                <SelectItem value="urgent">Urgent</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      )}

                      {uploadedFile.status === "processed" && (
                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <Badge className={`${getPriorityColor(uploadedFile.priority)} text-base px-3 py-1`}>
                              {uploadedFile.priority.charAt(0).toUpperCase() + uploadedFile.priority.slice(1)} Priority
                            </Badge>
                            <Badge variant="outline" className="text-base px-3 py-1">
                              {uploadedFile.domain.charAt(0).toUpperCase() + uploadedFile.domain.slice(1)}
                            </Badge>
                          </div>

                          {uploadedFile.clause && (
                            <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                              <h4 className="text-base font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                <FileCheck className="h-5 w-5 text-blue-600" />
                                Sample Extracted Clause:
                              </h4>
                              <p className="mb-3 leading-relaxed text-gray-800 text-base">{`"${uploadedFile.clause}"`}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="chat" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Chat Interface */}
              <div className="w-full lg:col-span-2">
                <Card className="h-[calc(100vh-250px)] min-h-[500px] max-h-[800px] flex flex-col">
                  <CardHeader className="text-center">
                    <CardTitle className="flex items-center justify-center gap-2 text-2xl">
                      <MessageSquare className="h-6 w-6 text-blue-600" />
                      AI Assistant
                    </CardTitle>
                    <CardDescription className="text-center text-base">Ask questions about your uploaded documents</CardDescription>
                    
                    {/* Document Selector */}
                    <div className="mt-4 text-xs text-gray-500">
                      {uploadedFiles.length} total files, {uploadedFiles.filter(f => f.status === "processed").length} processed
                    </div>
                    {uploadedFiles.filter(f => f.status === "processed").length > 0 ? (
                      <div className="mt-4">
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          Select Document to Query:
                        </label>
                        <Select
                          value={selectedDocument}
                          onValueChange={setSelectedDocument}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Choose a document" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Documents</SelectItem>
                            {uploadedFiles
                              .filter(f => f.status === "processed")
                              .map((file) => {
                                // Use the document ID if available, otherwise fall back to filename
                                const docId = file.id || file.filename || file.file.name;
                                return (
                                  <SelectItem key={docId} value={docId}>
                                    {file.filename || file.file.name}
                                  </SelectItem>
                                );
                              })}
                          </SelectContent>
                        </Select>
                        {selectedDocument !== "all" && (
                          <div className="mt-2 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                            🔍 Querying specific document: {uploadedFiles.find(f => (f.id || f.filename || f.file.name) === selectedDocument)?.filename || selectedDocument}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="mt-4 text-sm text-gray-500 bg-gray-50 px-3 py-2 rounded">
                        📄 Upload and process documents to start asking questions
                      </div>
                    )}
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col p-0">
                    <div className="flex-1 overflow-y-auto space-y-4 p-6" 
                         style={{
                           scrollbarWidth: 'thin' as const,
                           scrollbarColor: '#9ca3af #f3f4f6',
                         }}>
                      <style jsx global>{`
                        /* Custom scrollbar for WebKit browsers */
                        .chat-messages::-webkit-scrollbar {
                          width: 6px;
                        }
                        .chat-messages::-webkit-scrollbar-track {
                          background: #f3f4f6;
                          border-radius: 3px;
                        }
                        .chat-messages::-webkit-scrollbar-thumb {
                          background-color: #9ca3af;
                          border-radius: 3px;
                        }
                        .chat-messages::-webkit-scrollbar-thumb:hover {
                          background-color: #6b7280;
                        }
                      `}</style>
                      <div className="chat-messages h-full overflow-y-auto pr-2">
                        <div className="w-full space-y-4">
                          {chatMessages.map((message) => (
                            <div
                              key={message.id}
                              className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
                            >
                              <div
                                className={`max-w-[90%] p-3 rounded-lg break-words ${
                                  message.type === "user" 
                                    ? "bg-blue-600 text-white" 
                                    : "bg-gray-100 text-gray-900 border"
                                }`}
                              >
                                <div className="text-sm sm:text-base whitespace-pre-wrap break-words">{message.content}</div>
                                <p
                                  className={`text-xs mt-1 ${
                                    message.type === "user" ? "text-blue-100" : "text-gray-500"
                                  }`}
                                >
                                  {message.timestamp.toLocaleTimeString()}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      {isTyping && (
                        <div className="flex justify-start">
                          <div className="bg-gray-100 text-gray-900 border p-3 rounded-lg">
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                              <div
                                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                style={{ animationDelay: "0.1s" }}
                              ></div>
                              <div
                                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                style={{ animationDelay: "0.2s" }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      )}
                      </div>
                    </div>
                    <div className="border-t p-4 bg-gray-50">
                      <div className="flex gap-2 items-end">
                      <Textarea
                        placeholder="Ask a question about your documents..."
                        value={currentMessage}
                        onChange={(e) => setCurrentMessage(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault()
                            handleSendMessage()
                          }
                        }}
                        className="flex-1 min-h-[60px] resize-none"
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={!currentMessage.trim() || isTyping}
                        className="px-4"
                      >
                        <Send className="h-4 w-4 mb-0.5" />
                      </Button>
                    </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Quick Search</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input placeholder="Search documents..." className="pl-10" />
                    </div>
                    <Button className="w-full bg-transparent" variant="outline">
                      Advanced Search
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Document Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Documents:</span>
                      <span className="font-semibold">{uploadedFiles.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Processed:</span>
                      <span className="font-semibold text-green-600">
                        {uploadedFiles.filter((f) => f.status === "processed").length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Processing:</span>
                      <span className="font-semibold text-yellow-600">
                        {uploadedFiles.filter((f) => f.status === "processing" || f.status === "uploading").length}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Documents</p>
                      <p className="text-2xl font-bold text-gray-900">{uploadedFiles.length}</p>
                    </div>
                    <FileText className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Processed</p>
                      <p className="text-2xl font-bold text-green-600">
                        {uploadedFiles.filter((f) => f.status === "processed").length}
                      </p>
                    </div>
                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Processing</p>
                      <p className="text-2xl font-bold text-yellow-600">
                        {uploadedFiles.filter((f) => f.status === "processing" || f.status === "uploading").length}
                      </p>
                    </div>
                    <Clock className="h-8 w-8 text-yellow-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Errors</p>
                      <p className="text-2xl font-bold text-red-600">
                        {uploadedFiles.filter((f) => f.status === "error").length}
                      </p>
                    </div>
                    <AlertCircle className="h-8 w-8 text-red-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Domain Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {["insurance", "legal", "hr", "compliance"].map((domain) => {
                    const count = uploadedFiles.filter((f) => f.domain === domain).length
                    const percentage = uploadedFiles.length > 0 ? (count / uploadedFiles.length) * 100 : 0
                    return (
                      <div key={domain} className="space-y-2">
                        <div className="flex justify-between">
                          <span className="capitalize font-medium">{domain}</span>
                          <span className="text-sm text-gray-600">
                            {count} ({percentage.toFixed(1)}%)
                          </span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        )}
      </div>
    </div>
  )
}

