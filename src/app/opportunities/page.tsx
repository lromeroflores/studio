
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Opportunity } from '@/types/opportunity';
import { ArrowRight, Briefcase, FileText, Clock, Search, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ClientFormattedDate } from '@/components/common/client-formatted-date';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

function getStatusBadgeVariant(status: Opportunity['opportunityStatus']): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case 'New': return 'default';
    case 'In Progress': return 'secondary';
    case 'Completed': return 'outline';
    default: return 'secondary';
  }
}

// Maps backend status strings to frontend OpportunityStatus type
const mapApiStatusToOpportunityStatus = (apiStatus: string): Opportunity['opportunityStatus'] => {
  switch (apiStatus.toLowerCase()) {
    case 'prospecto':
      return 'New';
    case 'negociación':
      return 'In Progress';
    case 'cerrado':
      return 'Completed';
    default:
      return 'New'; // Default fallback
  }
};

const mapApiStatusToContractStatus = (apiStatus: string): Opportunity['contractStatus'] => {
    switch (apiStatus.toLowerCase()) {
        case 'prospecto': return 'Draft';
        case 'negociación': return 'Under Review';
        case 'cerrado': return 'Signed';
        default: return 'Draft';
    }
};

export default function OpportunitiesPage() {
  const router = useRouter();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for filters and sorting
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [contractTypeFilter, setContractTypeFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('desc'); // 'desc' for newest, 'asc' for oldest


  useEffect(() => {
    const fetchOpportunities = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('https://magicloops.dev/api/loop/f4f138b7-61e0-455e-913a-e6709d111f13/run');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        const mappedData: Opportunity[] = data.oportunidades.map((opp: any) => ({
          id: `opp-${opp.id_oportunidad}`,
          clientName: opp.nombre_oportunidad,
          contractId: `${opp.id_oportunidad}`, // Use raw ID for contract linking
          contractType: opp.tipo_contrato,
          opportunityStatus: mapApiStatusToOpportunityStatus(opp.estatus),
          contractStatus: mapApiStatusToContractStatus(opp.estatus),
          lastUpdated: opp.fecha,
          description: `Contract opportunity with ${opp.nombre_oportunidad}`,
        }));
        setOpportunities(mappedData);
      } catch (e: any) {
        setError(e.message || "An unexpected error occurred.");
        console.error("Failed to fetch opportunities:", e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOpportunities();
  }, []);

  const handleSelectOpportunity = (opportunity: Opportunity) => {
    const query = new URLSearchParams({
      contractId: opportunity.contractId,
      opportunityName: opportunity.clientName,
      contractType: opportunity.contractType,
    }).toString();
    router.push(`/editor?${query}`);
  };

  const uniqueContractTypes = useMemo(() => {
    if (!opportunities) return [];
    const types = new Set(opportunities.map(opp => opp.contractType));
    return Array.from(types);
  }, [opportunities]);

  const filteredAndSortedOpportunities = useMemo(() => {
    let filtered = opportunities.filter(opp => {
      const searchTermLower = searchTerm.toLowerCase();
      // Search by name, contract type, description, or ID
      return (
        opp.clientName.toLowerCase().includes(searchTermLower) ||
        opp.id.toLowerCase().includes(searchTermLower) ||
        opp.contractType.toLowerCase().includes(searchTermLower) ||
        opp.description.toLowerCase().includes(searchTermLower)
      );
    });

    if (statusFilter !== 'all') {
      filtered = filtered.filter(opp => opp.opportunityStatus === statusFilter);
    }

    if (contractTypeFilter !== 'all') {
      filtered = filtered.filter(opp => opp.contractType === contractTypeFilter);
    }

    return filtered.sort((a, b) => {
      const dateA = new Date(a.lastUpdated).getTime();
      const dateB = new Date(b.lastUpdated).getTime();
      if (sortOrder === 'desc') {
        return dateB - dateA;
      }
      return dateA - dateB;
    });
  }, [opportunities, searchTerm, statusFilter, contractTypeFilter, sortOrder]);

  
  const renderLoadingSkeletons = () => (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center justify-between p-4 border rounded-xl shadow-sm">
          <div className="flex flex-1 flex-col sm:flex-row sm:items-center sm:gap-6 min-w-0">
            <Skeleton className="h-6 w-2/5 mb-2 sm:mb-0" />
            <div className="flex items-center gap-4 sm:gap-6 text-sm">
              <Skeleton className="h-6 w-28" />
              <Skeleton className="h-6 w-44" />
              <Skeleton className="h-6 w-32 hidden md:block" />
            </div>
          </div>
          <Skeleton className="h-5 w-5 ml-4" />
        </div>
      ))}
    </div>
  );

  return (
    <div className="container mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Your Opportunities</h1>
        <p className="text-muted-foreground">
          Filter, sort, and select an opportunity to manage its contract.
        </p>
      </div>

      {/* Filter and Search Section */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6 p-4 border rounded-xl bg-card shadow-sm">
        <div className="relative w-full flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by name, type, ID..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full lg:w-auto">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="New">New</SelectItem>
              <SelectItem value="In Progress">In Progress</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
            </SelectContent>
          </Select>

          <Select value={contractTypeFilter} onValueChange={setContractTypeFilter}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Filter by Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {uniqueContractTypes.map(type => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortOrder} onValueChange={setSortOrder}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Sort by Date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">Newest First</SelectItem>
              <SelectItem value="asc">Oldest First</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        renderLoadingSkeletons()
      ) : error ? (
         <Card className="text-center py-16 shadow-md bg-destructive/10">
          <CardContent className="flex flex-col items-center justify-center p-6">
            <Briefcase className="h-12 w-12 text-destructive mb-4" />
            <h2 className="text-2xl font-semibold text-destructive-foreground">Failed to Load Opportunities</h2>
            <p className="text-lg text-muted-foreground mt-2">
              There was an error fetching data: {error}
            </p>
          </CardContent>
        </Card>
      ) : filteredAndSortedOpportunities.length === 0 ? (
        <Card className="text-center py-16 shadow-md">
          <CardContent className="flex flex-col items-center justify-center p-6">
            <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold">No Opportunities Found</h2>
            <p className="text-lg text-muted-foreground mt-2">
              {searchTerm || statusFilter !== 'all' || contractTypeFilter !== 'all'
                ? "No opportunities match your current filters."
                : "There are currently no opportunities assigned to you."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredAndSortedOpportunities.map((opp) => (
            <div
              key={opp.id}
              onClick={() => handleSelectOpportunity(opp)}
              className="group flex items-center justify-between p-4 border rounded-xl hover:bg-muted/50 cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md hover:border-primary/30"
            >
              <div className="flex flex-1 flex-col sm:flex-row sm:items-center sm:gap-6 min-w-0">
                <div className="font-medium text-lg text-foreground mb-2 sm:mb-0 sm:w-2/5 lg:w-1/3 truncate" title={opp.clientName}>
                  {opp.clientName}
                </div>
                <div className="flex items-center gap-4 sm:gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center justify-start w-28 shrink-0">
                    <Badge variant={getStatusBadgeVariant(opp.opportunityStatus)} className="w-full justify-center">{opp.opportunityStatus}</Badge>
                  </div>
                  <div className="flex items-center gap-2 w-44 shrink-0 truncate">
                    <FileText className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{opp.contractType}</span>
                  </div>
                  <div className="hidden md:flex items-center gap-2 w-32 shrink-0">
                    <Clock className="h-4 w-4 flex-shrink-0" />
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
