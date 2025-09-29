import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ShoppingCart, 
  Stethoscope, 
  GraduationCap, 
  Building2, 
  Utensils,
  Sparkles,
  TrendingUp,
  Users,
  Clock,
  DollarSign
} from "lucide-react";

interface CaseStudy {
  id: string;
  title: string;
  description: string;
  results: {
    metric: string;
    value: string;
    icon: React.ComponentType<{ className?: string }>;
  }[];
  tags: string[];
}

interface Industry {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  caseStudies: CaseStudy[];
}

const industries: Industry[] = [
  {
    id: "ecommerce",
    name: "E-commerce",
    icon: ShoppingCart,
    description: "Transform online shopping with AI voice agents",
    caseStudies: [
      {
        id: "ec1",
        title: "Fashion Retailer Voice Shopping Assistant",
        description: "A leading fashion brand deployed voice agents to help customers find products, check sizes, and complete purchases through natural conversation.",
        results: [
          { metric: "Conversion Rate", value: "+45%", icon: TrendingUp },
          { metric: "Avg Order Value", value: "+32%", icon: DollarSign },
          { metric: "Customer Satisfaction", value: "4.8/5", icon: Users }
        ],
        tags: ["Product Discovery", "Voice Commerce", "Personalization"]
      },
      {
        id: "ec2",
        title: "Supplement Store Consultation Agent",
        description: "Health supplement company using AI to provide personalized product recommendations and answer nutrition questions.",
        results: [
          { metric: "Sales Increase", value: "+67%", icon: TrendingUp },
          { metric: "Support Costs", value: "-40%", icon: DollarSign },
          { metric: "Response Time", value: "< 2 sec", icon: Clock }
        ],
        tags: ["Health & Wellness", "Product Guidance", "24/7 Support"]
      },
      {
        id: "ec3",
        title: "Electronics Store Technical Support",
        description: "Consumer electronics retailer deployed agents to handle technical questions and troubleshooting before and after purchase.",
        results: [
          { metric: "Return Rate", value: "-28%", icon: TrendingUp },
          { metric: "Support Tickets", value: "-55%", icon: Users },
          { metric: "Resolution Time", value: "-70%", icon: Clock }
        ],
        tags: ["Technical Support", "Post-Purchase", "Troubleshooting"]
      },
      {
        id: "ec4",
        title: "Luxury Goods Personal Shopper",
        description: "High-end luxury brand created voice agents that act as personal shoppers, providing exclusive recommendations and styling advice.",
        results: [
          { metric: "Engagement Rate", value: "+89%", icon: Users },
          { metric: "Client Retention", value: "+41%", icon: TrendingUp },
          { metric: "Upsell Success", value: "+53%", icon: DollarSign }
        ],
        tags: ["Luxury", "Personal Service", "VIP Experience"]
      },
      {
        id: "ec5",
        title: "Subscription Box Onboarding",
        description: "Subscription service uses voice agents to personalize preferences and guide new customers through their first experience.",
        results: [
          { metric: "Completion Rate", value: "+76%", icon: TrendingUp },
          { metric: "First Month Churn", value: "-34%", icon: Users },
          { metric: "Satisfaction Score", value: "9.1/10", icon: Sparkles }
        ],
        tags: ["Onboarding", "Subscription", "Personalization"]
      }
    ]
  },
  {
    id: "healthcare",
    name: "Healthcare",
    icon: Stethoscope,
    description: "Improve patient care and streamline healthcare operations",
    caseStudies: [
      {
        id: "hc1",
        title: "Medical Clinic Appointment Scheduling",
        description: "Multi-location clinic deployed voice agents to handle appointment bookings, rescheduling, and patient intake 24/7.",
        results: [
          { metric: "Booking Rate", value: "+82%", icon: TrendingUp },
          { metric: "No-Shows", value: "-45%", icon: Users },
          { metric: "Admin Time", value: "-60%", icon: Clock }
        ],
        tags: ["Scheduling", "Patient Intake", "Automation"]
      },
      {
        id: "hc2",
        title: "Pharmacy Prescription Refills",
        description: "National pharmacy chain using AI agents to process refill requests and answer medication questions.",
        results: [
          { metric: "Call Handling", value: "+90%", icon: TrendingUp },
          { metric: "Wait Times", value: "-75%", icon: Clock },
          { metric: "Patient Satisfaction", value: "4.7/5", icon: Users }
        ],
        tags: ["Pharmacy", "Prescriptions", "Patient Support"]
      },
      {
        id: "hc3",
        title: "Telehealth Triage Assistant",
        description: "Telemedicine platform deployed agents to conduct initial symptom assessment and route patients to appropriate care.",
        results: [
          { metric: "Triage Accuracy", value: "94%", icon: Sparkles },
          { metric: "Doctor Time Saved", value: "+40%", icon: Clock },
          { metric: "Patient Throughput", value: "+65%", icon: Users }
        ],
        tags: ["Telemedicine", "Triage", "Remote Care"]
      },
      {
        id: "hc4",
        title: "Mental Health Check-in Agent",
        description: "Wellness app integrated voice agents for daily mental health check-ins and crisis detection.",
        results: [
          { metric: "Daily Engagement", value: "+78%", icon: Users },
          { metric: "Early Intervention", value: "+52%", icon: TrendingUp },
          { metric: "User Retention", value: "+43%", icon: Sparkles }
        ],
        tags: ["Mental Health", "Wellness", "Daily Check-ins"]
      },
      {
        id: "hc5",
        title: "Hospital Post-Discharge Follow-up",
        description: "Hospital system uses voice agents to check on patients after discharge and identify complications early.",
        results: [
          { metric: "Readmissions", value: "-31%", icon: TrendingUp },
          { metric: "Follow-up Rate", value: "+88%", icon: Users },
          { metric: "Patient Outcomes", value: "+37%", icon: Sparkles }
        ],
        tags: ["Post-Discharge", "Patient Monitoring", "Care Quality"]
      }
    ]
  },
  {
    id: "education",
    name: "Education",
    icon: GraduationCap,
    description: "Enhance learning experiences with AI-powered tutoring",
    caseStudies: [
      {
        id: "ed1",
        title: "University Admissions Assistant",
        description: "Major university deployed voice agents to guide prospective students through the application process and answer questions.",
        results: [
          { metric: "Application Rate", value: "+56%", icon: TrendingUp },
          { metric: "Inquiry Response", value: "< 1 min", icon: Clock },
          { metric: "Student Satisfaction", value: "4.6/5", icon: Users }
        ],
        tags: ["Admissions", "Student Support", "Higher Education"]
      },
      {
        id: "ed2",
        title: "Online Course Tutoring Agent",
        description: "EdTech platform integrated AI tutors to provide personalized help and answer student questions in real-time.",
        results: [
          { metric: "Course Completion", value: "+71%", icon: TrendingUp },
          { metric: "Learning Speed", value: "+42%", icon: Clock },
          { metric: "Grade Improvement", value: "+38%", icon: Sparkles }
        ],
        tags: ["Online Learning", "Tutoring", "Student Success"]
      },
      {
        id: "ed3",
        title: "Language Learning Voice Coach",
        description: "Language app deployed conversational agents for pronunciation practice and real-world dialogue simulation.",
        results: [
          { metric: "Practice Time", value: "+94%", icon: Clock },
          { metric: "Fluency Gains", value: "+62%", icon: TrendingUp },
          { metric: "User Engagement", value: "+85%", icon: Users }
        ],
        tags: ["Language Learning", "Speaking Practice", "Pronunciation"]
      },
      {
        id: "ed4",
        title: "K-12 Homework Help Agent",
        description: "Educational platform provides voice-based homework assistance for students in multiple subjects.",
        results: [
          { metric: "Student Confidence", value: "+68%", icon: Sparkles },
          { metric: "Homework Completion", value: "+73%", icon: TrendingUp },
          { metric: "Parent Satisfaction", value: "4.8/5", icon: Users }
        ],
        tags: ["K-12", "Homework Help", "Academic Support"]
      },
      {
        id: "ed5",
        title: "Corporate Training Assistant",
        description: "Enterprise training platform uses voice agents to deliver interactive training and assess employee knowledge.",
        results: [
          { metric: "Training Completion", value: "+81%", icon: TrendingUp },
          { metric: "Knowledge Retention", value: "+54%", icon: Sparkles },
          { metric: "Training Costs", value: "-47%", icon: DollarSign }
        ],
        tags: ["Corporate Training", "Professional Development", "Skills Assessment"]
      }
    ]
  },
  {
    id: "realestate",
    name: "Real Estate",
    icon: Building2,
    description: "Streamline property search and client management",
    caseStudies: [
      {
        id: "re1",
        title: "Property Search Voice Assistant",
        description: "Real estate agency deployed agents to help clients search properties, schedule viewings, and answer property questions.",
        results: [
          { metric: "Lead Qualification", value: "+64%", icon: TrendingUp },
          { metric: "Viewing Bookings", value: "+79%", icon: Users },
          { metric: "Agent Time Saved", value: "15 hrs/week", icon: Clock }
        ],
        tags: ["Property Search", "Lead Qualification", "Viewing Scheduling"]
      },
      {
        id: "re2",
        title: "Rental Application Processing",
        description: "Property management company uses AI to guide tenants through applications and answer rental questions.",
        results: [
          { metric: "Application Speed", value: "-68%", icon: Clock },
          { metric: "Complete Applications", value: "+84%", icon: TrendingUp },
          { metric: "Admin Costs", value: "-52%", icon: DollarSign }
        ],
        tags: ["Rental Applications", "Property Management", "Tenant Support"]
      },
      {
        id: "re3",
        title: "Luxury Home Concierge Agent",
        description: "High-end real estate firm created voice agents that act as personal concierges for luxury property inquiries.",
        results: [
          { metric: "Client Engagement", value: "+92%", icon: Users },
          { metric: "Deal Close Rate", value: "+38%", icon: TrendingUp },
          { metric: "Client Satisfaction", value: "9.3/10", icon: Sparkles }
        ],
        tags: ["Luxury Real Estate", "Concierge Service", "High-End Sales"]
      },
      {
        id: "re4",
        title: "Commercial Property Leasing",
        description: "Commercial real estate company deployed agents to handle lease inquiries and provide property information.",
        results: [
          { metric: "Response Time", value: "< 30 sec", icon: Clock },
          { metric: "Qualified Leads", value: "+71%", icon: TrendingUp },
          { metric: "Lease Conversions", value: "+44%", icon: DollarSign }
        ],
        tags: ["Commercial Real Estate", "Leasing", "B2B Sales"]
      },
      {
        id: "re5",
        title: "New Development Sales Agent",
        description: "Property developer uses voice agents to provide information about new developments and handle pre-sales inquiries.",
        results: [
          { metric: "Inquiry Handling", value: "+96%", icon: Users },
          { metric: "Pre-sale Bookings", value: "+58%", icon: TrendingUp },
          { metric: "Sales Cycle", value: "-35%", icon: Clock }
        ],
        tags: ["New Developments", "Pre-sales", "Project Marketing"]
      }
    ]
  },
  {
    id: "hospitality",
    name: "Hospitality & Food",
    icon: Utensils,
    description: "Enhance guest experiences and optimize operations",
    caseStudies: [
      {
        id: "ho1",
        title: "Restaurant Reservation System",
        description: "Restaurant chain deployed voice agents to handle reservations, waitlist management, and special requests.",
        results: [
          { metric: "Reservation Rate", value: "+73%", icon: TrendingUp },
          { metric: "Phone Answer Rate", value: "100%", icon: Users },
          { metric: "No-Shows", value: "-42%", icon: Clock }
        ],
        tags: ["Reservations", "Restaurant", "Customer Service"]
      },
      {
        id: "ho2",
        title: "Hotel Concierge Voice Agent",
        description: "Boutique hotel chain created AI concierges to assist guests with bookings, recommendations, and requests 24/7.",
        results: [
          { metric: "Guest Satisfaction", value: "+61%", icon: Sparkles },
          { metric: "Upsell Revenue", value: "+48%", icon: DollarSign },
          { metric: "Staff Efficiency", value: "+55%", icon: Clock }
        ],
        tags: ["Hotel", "Concierge", "Guest Services"]
      },
      {
        id: "ho3",
        title: "Food Delivery Order Assistant",
        description: "Food delivery service integrated voice agents to take orders, handle modifications, and track deliveries.",
        results: [
          { metric: "Order Accuracy", value: "98%", icon: Sparkles },
          { metric: "Order Volume", value: "+87%", icon: TrendingUp },
          { metric: "Customer Retention", value: "+52%", icon: Users }
        ],
        tags: ["Food Delivery", "Order Taking", "Customer Support"]
      },
      {
        id: "ho4",
        title: "Catering Sales Agent",
        description: "Catering company uses voice agents to handle event inquiries, menu consultations, and quote generation.",
        results: [
          { metric: "Lead Response", value: "< 2 min", icon: Clock },
          { metric: "Quote Conversion", value: "+66%", icon: TrendingUp },
          { metric: "Booking Value", value: "+39%", icon: DollarSign }
        ],
        tags: ["Catering", "Event Planning", "Sales"]
      },
      {
        id: "ho5",
        title: "Coffee Chain Loyalty Program",
        description: "Coffee shop chain deployed agents to manage loyalty program inquiries and promote personalized offers.",
        results: [
          { metric: "Loyalty Sign-ups", value: "+89%", icon: Users },
          { metric: "Repeat Visits", value: "+74%", icon: TrendingUp },
          { metric: "Offer Redemption", value: "+63%", icon: DollarSign }
        ],
        tags: ["Loyalty Programs", "Customer Retention", "Promotions"]
      }
    ]
  }
];

export function PopularUseCases() {
  const [selectedIndustry, setSelectedIndustry] = useState(industries[0].id);
  const currentIndustry = industries.find(i => i.id === selectedIndustry) || industries[0];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Popular Use Cases by Industry</h1>
        <p className="text-muted-foreground">
          Explore real-world success stories and proven use cases across different industries
        </p>
      </div>

      <Tabs value={selectedIndustry} onValueChange={setSelectedIndustry}>
        <TabsList className="grid w-full grid-cols-5">
          {industries.map(industry => {
            const Icon = industry.icon;
            return (
              <TabsTrigger key={industry.id} value={industry.id} className="flex items-center gap-2">
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{industry.name}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {industries.map(industry => (
          <TabsContent key={industry.id} value={industry.id} className="space-y-6">
            <Card className="p-6 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <industry.icon className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-2">{industry.name}</h2>
                  <p className="text-muted-foreground">{industry.description}</p>
                </div>
              </div>
            </Card>

            <div className="grid gap-6">
              {industry.caseStudies.map(caseStudy => (
                <Card key={caseStudy.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xl font-semibold mb-2">{caseStudy.title}</h3>
                      <p className="text-muted-foreground">{caseStudy.description}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {caseStudy.results.map((result, idx) => {
                        const Icon = result.icon;
                        return (
                          <div key={idx} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                            <Icon className="w-5 h-5 text-primary flex-shrink-0" />
                            <div>
                              <div className="text-2xl font-bold">{result.value}</div>
                              <div className="text-xs text-muted-foreground">{result.metric}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {caseStudy.tags.map(tag => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <Button variant="outline" className="w-full">
                      <Sparkles className="w-4 h-4 mr-2" />
                      Use This Template
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
