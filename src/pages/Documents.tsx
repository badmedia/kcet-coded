import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { FileText, CheckCircle, AlertCircle, Copy, FileCheck } from "lucide-react"

const Documents = () => {
  const documentCategories = [
    {
      title: "Essential Academic Documents",
      documents: [
        {
          name: "SSLC/10th Standard Marks Card",
          type: "Original",
          copies: 1,
          description: "Original marks card or equivalent certificate",
          required: true
        },
        {
          name: "2nd PUC/12th Standard Marks Card",
          type: "Original",
          copies: 1,
          description: "Original marks card or equivalent certificate",
          required: true
        },
        {
          name: "12th Standard Study Certificate",
          type: "Original",
          copies: 1,
          description: "Must include SSLC or 2nd PUC/12th std details, combined into single PDF",
          required: true
        },
        {
          name: "12th Standard Transfer Certificate",
          type: "Original",
          copies: 1,
          description: "Transfer certificate from the last institution attended",
          required: true
        }
      ]
    },
    {
      title: "KCET/NEET Related Documents",
      documents: [
        {
          name: "KEA UGCET/UG-NEET 2025 Verification Slip",
          type: "Copy",
          copies: 1,
          description: "Official verification slip from KEA",
          required: true
        },
        {
          name: "KEA UGCET/UG-NEET 2025 Online Application Form",
          type: "Copy",
          copies: 1,
          description: "Complete online application form",
          required: true
        },
        {
          name: "CET/NEET 2025 Admission Ticket",
          type: "Copy",
          copies: 1,
          description: "Original admission ticket for the entrance exam",
          required: true
        },
        {
          name: "Confirmation Slip",
          type: "Copy",
          copies: 1,
          description: "Confirmation slip from the application process",
          required: true
        },
        {
          name: "Fee Receipt",
          type: "Original",
          copies: 1,
          description: "Original fee payment receipt",
          required: true
        }
      ]
    },
    {
      title: "Identity and Personal Documents",
      documents: [
        {
          name: "Photo Identity Proof",
          type: "Original + Copy",
          copies: 1,
          description: "PAN Card, Driving License, Voter ID, Passport, or Aadhaar Card",
          required: true
        },
        {
          name: "Aadhaar Card",
          type: "Copy",
          copies: 1,
          description: "Copy of Aadhaar card for verification",
          required: true
        },
        {
          name: "Passport Size Photos",
          type: "Original",
          copies: 2,
          description: "Recent passport size photographs",
          required: true
        }
      ]
    },
    {
      title: "Reservation and Category Documents",
      documents: [
        {
          name: "Caste/Income Certificate",
          type: "Copy",
          copies: 1,
          description: "For SC/ST (Form-D), Cat-1 (Form-E), 2A, 2B, 3A & 3B (Form-F). Must be issued by concerned Tahsildar of Karnataka",
          required: false
        },
        {
          name: "Hyd-Karnataka / 371(j) Certificate",
          type: "Copy",
          copies: 1,
          description: "Certificate issued by competent authority for claiming reservation under 371(j) (Annexure-A)",
          required: false
        },
        {
          name: "Rural Certificate",
          type: "Copy",
          copies: 1,
          description: "For candidates claiming rural reservation benefits",
          required: false
        }
      ]
    }
  ]



  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
        <p className="text-muted-foreground">Complete list of documents required for KCET/UG-NEET 2025 admission process.</p>
      </div>

      <div className="space-y-6">
        {documentCategories.map((category, categoryIndex) => (
          <Card key={categoryIndex} className="rounded-none border-2 shadow-[6px_6px_0_0_rgba(0,0,0,0.35)] dark:shadow-[6px_6px_0_0_rgba(255,255,255,0.12)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {category.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {category.documents.map((doc, docIndex) => (
                  <div key={docIndex} className="flex items-start justify-between p-4 border rounded-lg bg-muted/30">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{doc.name}</h3>
                        {doc.required ? (
                          <Badge variant="destructive" className="text-xs">Required</Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">If Applicable</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{doc.description}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-sm font-medium">
                          <Copy className="h-4 w-4" />
                          {doc.type}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {doc.copies} {doc.copies === 1 ? 'copy' : 'copies'}
                        </div>
                      </div>
                      {doc.required ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-yellow-600" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}

        <Card className="rounded-none border-2 shadow-[6px_6px_0_0_rgba(0,0,0,0.35)] dark:shadow-[6px_6px_0_0_rgba(255,255,255,0.12)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileCheck className="h-5 w-5" />
              Important Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <p>All documents mentioned above must be arranged in the same order as listed</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <p>Keep one complete set of copies in the same order for your records</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <p>All original documents must be in good condition and clearly legible</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <p>Category certificates must be issued by the competent authority in Karnataka</p>
              </div>
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <p>Documents marked as "If Applicable" are only required if you belong to that specific category</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Documents


