import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { TrailCreationSidebar } from "@/components/trail-creation-sidebar";
import { InteractiveMap } from "@/components/interactive-map";
import { TrailStatsOverlay } from "@/components/trail-stats-overlay";
import { LoadingOverlay } from "@/components/ui/loading-overlay";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { TrailPoint, type TrailFormData } from "@shared/schema";
import { generateCreateTrailMutation } from "@/lib/graphql-client";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, HelpCircle, Route, Copy } from "lucide-react";

// Using TrailFormData type from @shared/schema

export default function TrailCreator() {
  const [points, setPoints] = useState<TrailPoint[]>([]);
  const [drawingMode, setDrawingMode] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [createdTrail, setCreatedTrail] = useState<any>(null);

  const { toast } = useToast();

  const generateGraphQLMutation = useMutation({
    mutationFn: async (data: TrailFormData & { points: TrailPoint[] }) => {
      if (data.points.length === 0) {
        throw new Error("Please add at least one point to the trail");
      }

      // Create GraphQL input directly
      const graphqlTrailInput = {
        name: data.name,
        location: {
          country: data.country,
          city: data.city,
          point: { lat: data.points[0].lat, lon: data.points[0].lon },
          title: null,
        },
        track: {
          points: data.points,
        },
        description: data.description || "",
        isActive: data.isActive,
        distance: data.distance,
        approximateTime: data.approximateTime,
        imagesIds: [],
        availableDisciplinesIds: [],
        allowedForStartingDisciplinesIds: [],
      };
      
      // Generate GraphQL mutation string
      const graphqlQuery = generateCreateTrailMutation(graphqlTrailInput);
      return { query: graphqlQuery, data: graphqlTrailInput };
    },
    onSuccess: (result) => {
      setCreatedTrail(result);
      setShowSuccessModal(true);
      toast({
        title: "GraphQL Query Generated",
        description: "Your trail GraphQL mutation has been generated successfully.",
      });
    },
    onError: (error) => {
      setErrorMessage(error.message || "Failed to generate GraphQL query");
      setShowErrorModal(true);
      toast({
        title: "Error",
        description: error.message || "Failed to generate GraphQL query",
        variant: "destructive",
      });
    },
  });

  const handlePointAdd = (point: TrailPoint) => {
    setPoints(prev => [...prev, point]);
  };

  const handlePointRemove = (index: number) => {
    setPoints(prev => prev.filter((_, i) => i !== index));
  };

  const handleClearAll = () => {
    setPoints([]);
    setDrawingMode(false);
  };

  const handleTrailSubmit = (formData: TrailFormData) => {
    if (points.length < 2) {
      toast({
        title: "Insufficient Points",
        description: "Please add at least 2 points to create a trail.",
        variant: "destructive",
      });
      return;
    }

    generateGraphQLMutation.mutate({ ...formData, points });
  };

  const handleCreateNew = () => {
    setShowSuccessModal(false);
    setCreatedTrail(null);
    handleClearAll();
  };

  const calculateDistance = (points: TrailPoint[]): number => {
    if (points.length < 2) return 0;
    
    let total = 0;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      
      const R = 6371e3;
      const φ1 = (prev.lat * Math.PI) / 180;
      const φ2 = (curr.lat * Math.PI) / 180;
      const Δφ = ((curr.lat - prev.lat) * Math.PI) / 180;
      const Δλ = ((curr.lon - prev.lon) * Math.PI) / 180;

      const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      
      total += R * c;
    }
    return Math.round(total);
  };

  const distance = calculateDistance(points);
  const estimatedTime = Math.round(distance / 1000 * 15 * 60000); // 15 min per km

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Route className="text-white text-sm" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900">Trail Creator</h1>
            </div>
            <div className="flex items-center space-x-4">
              {/* GraphQL generation mode - no authentication needed */}
              <Button variant="ghost" size="sm">
                <HelpCircle className="w-4 h-4 mr-2" />
                Help
              </Button>

            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
        <TrailCreationSidebar
          points={points}
          onSubmit={handleTrailSubmit}
          onClearTrail={handleClearAll}
          onRemovePoint={handlePointRemove}
          isSubmitting={generateGraphQLMutation.isPending}
        />
        
        <div className="flex-1 relative">
          <InteractiveMap
            points={points}
            onPointAdd={handlePointAdd}
            onPointRemove={handlePointRemove}
            onClearAll={handleClearAll}
            drawingMode={drawingMode}
            onDrawingModeToggle={() => setDrawingMode(!drawingMode)}
          />
          
          <TrailStatsOverlay
            points={points}
            distance={distance}
            estimatedTime={estimatedTime}
          />
        </div>
      </div>

      <LoadingOverlay 
        isVisible={generateGraphQLMutation.isPending}
        message="Please wait while we generate your GraphQL mutation..."
      />

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="text-white h-8 w-8" />
              </div>
              <DialogTitle className="text-xl font-semibold text-gray-900 mb-2">
                GraphQL Query Generated!
              </DialogTitle>
              <p className="text-gray-600 mb-6">
                Your trail GraphQL mutation has been generated successfully. You can copy and use it with your GraphQL service.
              </p>
              
              {createdTrail && (
                <div className="bg-white p-4 rounded-lg border text-left mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">Generated GraphQL Mutation:</h4>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(createdTrail.query);
                        toast({ title: "Copied to clipboard!" });
                      }}
                    >
                      <Copy className="w-4 h-4 mr-1" />
                      Copy
                    </Button>
                  </div>
                  <Textarea
                    value={createdTrail.query}
                    readOnly
                    className="font-mono text-xs h-64 resize-none"
                  />
                </div>
              )}
              
              <div className="flex space-x-3 w-full">
                <Button 
                  className="flex-1"
                  onClick={handleCreateNew}
                >
                  Create New Trail
                </Button>
              </div>
            </div>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      {/* Error Modal */}
      <Dialog open={showErrorModal} onOpenChange={setShowErrorModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mb-4">
                <XCircle className="text-white h-8 w-8" />
              </div>
              <DialogTitle className="text-xl font-semibold text-gray-900 mb-2">
                Error Generating GraphQL
              </DialogTitle>
              <p className="text-gray-600 mb-6">
                {errorMessage}
              </p>
              <div className="flex space-x-3 w-full">
                <Button 
                  variant="destructive" 
                  className="flex-1"
                  onClick={() => setShowErrorModal(false)}
                >
                  Try Again
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setShowErrorModal(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}
