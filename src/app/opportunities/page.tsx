
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Opportunity } from '@/types/opportunity';
import { ArrowRight, Briefcase, FileText, Clock, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ClientFormattedDate } from '@/components/common/client-formatted-date';

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

function getStatusBadgeVariant(status: Opportunity['opportunityStatus']): "default" | "secondary" | "destructive" | "outline" {
  switch (status.toLowerCase()) {
    case 'new': return 'default';
    case 'in progress': return 'secondary';
    case 'pending review': return 'outline';
    case 'completed': return 'default';
    case 'closed': return 'outline';
    default: return 'secondary';
  }
}

export default function OpportunitiesPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = React.useState('');

  const handleSelectOpportunity = (opportunity: Opportunity) => {
    router.push(`/editor?contractId=${opportunity.contractId}`);
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
          <CardContent className="flex flex-col items-center justify-center p-6">
            <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold">No Opportunities Found</h2>
            <p className="text-lg text-muted-foreground mt-2">
              {searchTerm ? "No opportunities match your search." : "There are currently no opportunities assigned to you."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredOpportunities.map((opp) => (
            <div
              key={opp.id}
              onClick={() => handleSelectOpportunity(opp)}
              className="group flex items-center justify-between p-4 border rounded-xl hover:bg-muted/50 cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md hover:border-primary/30"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-6 w-full min-w-0">
                <div className="font-medium text-lg text-foreground mb-2 sm:mb-0 sm:w-56 md:w-72 truncate" title={opp.clientName}>
                  {opp.clientName}
                </div>
                <div className="flex items-center gap-4 sm:gap-6 text-sm text-muted-foreground">
                  <Badge variant={getStatusBadgeVariant(opp.opportunityStatus)}>{opp.opportunityStatus}</Badge>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span className="truncate">{opp.contractType}</span>
                  </div>
                  <div className="hidden md:flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <ClientFormattedDate dateString={opp.lastUpdated} />
                  </div>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all ml-4" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
