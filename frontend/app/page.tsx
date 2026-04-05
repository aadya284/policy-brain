"use client"
import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Dashboard from "./dashboard"

export default function HomePage() {
  const [currentPage, setCurrentPage] = useState<"home" | "dashboard">("home")

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  if (currentPage === "dashboard") {
    return <Dashboard onBackToHome={() => setCurrentPage("home")} />
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-[#133E87] text-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <Image 
                  src="/logo.png" 
                  alt="Policy Brain Logo" 
                  width={80} 
                  height={80} 
                  className="h-20 w-20 object-contain"
                />
                <span className="text-xl font-semibold text-white">Policy Brain</span>
              </div>
            </div>
            <nav className="flex space-x-8">
              <Button
                variant="ghost"
                className="text-white hover:text-blue-100 hover:bg-[#133E87]/80"
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              >
                Home
              </Button>
              <Button
                variant="ghost"
                className="text-white hover:text-blue-100 hover:bg-[#133E87]/80"
                onClick={() => setCurrentPage("dashboard")}
              >
                Sign In
              </Button>
              <Button
                variant="ghost"
                className="text-white hover:text-blue-100 hover:bg-[#133E87]/80"
                onClick={() => scrollToSection("insights-section")}
              >
                About
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-[#608BC1] text-white py-24">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h1 className="text-5xl font-bold mb-6 leading-tight">Intelligent Document Analysis for Your Business</h1>
          <p className="text-xl mb-8 text-blue-100 leading-relaxed max-w-3xl mx-auto">
            Empowering decisions across Insurance, Legal, HR, and Compliance domains with AI-powered insights.
          </p>
          <Button
            size="lg"
            className="bg-[#FF7D29] hover:bg-[#FF7D29]/90 text-white px-8 py-3 text-lg font-semibold rounded-lg"
            onClick={() => setCurrentPage("dashboard")}
          >
            Get Started
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section id="insights-section" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Unlock Powerful Insights</h2>
            <p className="text-xl text-gray-600">Find exactly what you need — no matter how long the document.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {/* Row 1 */}
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-[#608BC1] text-white rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Multi-Format Support</h3>
              <p className="text-gray-600 leading-relaxed">
                Seamlessly upload and process documents in PDF, DOCX, and Email formats.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-[#608BC1] text-white rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Advanced Semantic Search</h3>
              <p className="text-gray-600 leading-relaxed">
                Find precise answers within vast document libraries using intelligent vector-based search.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-[#608BC1] text-white rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Intelligent Clause Matching</h3>
              <p className="text-gray-600 leading-relaxed">
                Accurately identify and retrieve specific clauses and relevant sections from complex documents.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Row 2 */}
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-[#608BC1] text-white rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                4
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Explainable AI Decisions</h3>
              <p className="text-gray-600 leading-relaxed">
                Gain trust with clear, concise rationales behind every AI-generated insight and recommendation.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-[#608BC1] text-white rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                5
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Domain-Specific Expertise</h3>
              <p className="text-gray-600 leading-relaxed">
                Tailored intelligence for Insurance, Legal, HR, and Compliance domains.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-[#608BC1] text-white rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                6
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Real-time Insights</h3>
              <p className="text-gray-600 leading-relaxed">
                Experience immediate document processing and instant query analysis capabilities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl font-bold text-gray-800 mb-6">Ready to Transform Your Document Analysis?</h2>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Start leveraging the power of AI to streamline your policy and document management today.
          </p>
          <Button
            size="lg"
            className="bg-[#608BC1] hover:bg-[#133E87] text-white px-8 py-3 text-lg font-semibold rounded-lg"
            onClick={() => setCurrentPage("dashboard")}
          >
            Go to Dashboard
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-gray-600">© 2024 Policy Brain. All rights reserved.</p>
          <p className="text-sm text-gray-500 mt-2">
            Powered by advanced LLM technology. Built for enterprise document analysis.
          </p>
        </div>
      </footer>
    </div>
  )
}
