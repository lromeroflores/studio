
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Opportunity } from '@/types/opportunity';
import { ArrowRight, Briefcase, FileText, Clock, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

// Mock Data
const mockOpportunitiesData: Opportunity[] = [
  {
    id: 'opp-001',
    clientName: 'Tech Solutions Inc.',
    contractId: 'nda-v1-tech',
    contractType: 'Non-Disclosure Agreement',
    opportunityStatus: 'New',
    contractStatus: 'Draft',
    lastUpdated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    description: 'Review and finalize NDA for potential partnership discussions with new AI vendor.',
  },
  {
    id: 'opp-002',
    clientName: 'Global Innovations Ltd.',
    contractId: 'sa-v1-global',
    contractType: 'Service Agreement',
    opportunityStatus: 'In Progress',
    contractStatus: 'Under Review',
    lastUpdated: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    description: 'Negotiate terms for the new software development service agreement, focusing on IP rights.',
  },
  {
    id: 'opp-003',
    clientName: 'Alpha Builders Co.',
    contractId: 'const-v2-alpha',
    contractType: 'Construction Contract',
    opportunityStatus: 'Pending Review',
    contractStatus: 'Negotiation',
    lastUpdated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    description: 'Final legal review of the construction contract for the new HQ project, check liability clauses.',
  },
  {
    id: 'opp-004',
    clientName: 'MediCare Health',
    contractId: 'hipaa-v1-medi',
    contractType: 'HIPAA BAA',
    opportunityStatus: 'Completed',
    contractStatus: 'Signed',
    lastUpdated: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    description: 'HIPAA Business Associate Agreement successfully executed and archived with new imaging partner.',
  },
  {
    id: 'opp-005',
    clientName: 'FinTech Future Group',
    contractId: 'invest-s1-fin',
    contractType: 'Investment Agreement',
    opportunityStatus: 'New',
    contractStatus: 'Draft',
    lastUpdated: new Date(Date.now() - 0.5 * 24 * 60 * 60 * 1000).toISOString(),
    description: 'Draft Series A investment agreement for upcoming funding round.',
  },
  {
    id: 'opp-006',
    clientName: 'Eco Renewables Corp.',
    contractId: 'supply-v3-eco',
    contractType: 'Supply Agreement',
    opportunityStatus: 'Closed',
    contractStatus: 'Archived',
    lastUpdated: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    description: 'Long-term supply agreement for solar panels, successfully concluded and archived.',
  },
];

function getStatusBadgeVariant(status: Opportunity['opportunityStatus'] | Opportunity['contractStatus']): "default" | "secondary" | "destructive" | "outline" {
  switch (status.toLowerCase()) {
    case 'new': return 'default';
    case 'draft': return 'default';
    case 'in progress': return 'secondary';
    case 'under review': return 'secondary';
    case 'negotiation': return 'secondary';
    case 'pending review': return 'outline';
    case 'completed': return 'default'; // Consider a "success" variant (e.g., green) if available
    case 'signed': return 'default'; // Consider a "success" variant
    case 'closed': return 'outline';
    case 'archived': return 'outline';
    default: return 'secondary';
  }
}

export default function OpportunitiesPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = React.useState('');

  const handleSelectOpportunity = (opportunity: Opportunity) => {
    router.push(`/editor?contractId=${opportunity.contractId}`); // Pass contractId as query param
  };

  const filteredOpportunities = mockOpportunitiesData.filter(opp =>
    opp.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    opp.contractType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    opp.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Your Opportunities</h1>
          <p className="text-muted-foreground">
            Select an opportunity to view and edit the associated contract.
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search opportunities..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {filteredOpportunities.length === 0 ? (
        <Card className="text-center py-16 shadow-md">
          <CardHeader>
            <Briefcase className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <CardTitle className="text-2xl">No Opportunities Found</CardTitle>
            <CardDescription className="text-lg text-muted-foreground">
              {searchTerm ? "No opportunities match your search." : "There are currently no opportunities assigned to you."}
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredOpportunities.map((opp) => (
            <Card key={opp.id} className="flex flex-col justify-between shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out rounded-xl border hover:border-primary/50">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start mb-3">
                    <CardTitle className="text-xl font-semibold text-foreground">{opp.clientName}</CardTitle>
                    <Badge variant={getStatusBadgeVariant(opp.opportunityStatus)} className="text-xs px-2 py-1">{opp.opportunityStatus}</Badge>
                </div>
                <div className="space-y-1.5">
                    <CardDescription className="flex items-center text-sm text-muted-foreground">
                        <FileText className="mr-2 h-4 w-4 flex-shrink-0" /> {opp.contractType}
                    </CardDescription>
                    <CardDescription className="flex items-center text-sm text-muted-foreground">
                        <Briefcase className="mr-2 h-4 w-4 flex-shrink-0" /> Contract: <Badge variant={getStatusBadgeVariant(opp.contractStatus)} className="ml-1.5 text-xs px-2 py-1">{opp.contractStatus}</Badge>
                    </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="flex-grow pb-4">
                <p className="text-sm text-foreground/80 leading-relaxed line-clamp-3">{opp.description}</p>
              </CardContent>
              <CardFooter className="flex flex-col items-start pt-4 border-t mt-auto">
                <div className="text-xs text-muted-foreground mb-4 flex items-center w-full">
                   <Clock className="mr-1.5 h-3.5 w-3.5" /> Last Updated: {new Date(opp.lastUpdated).toLocaleDateString()}
                </div>
                <Button onClick={() => handleSelectOpportunity(opp)} className="w-full font-medium" size="lg">
                  Work on Opportunity <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
