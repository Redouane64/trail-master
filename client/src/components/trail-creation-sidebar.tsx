import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { TrailPoint, trailFormSchema, type TrailFormData } from "@shared/schema";
import { useJWTAuth } from "@/contexts/jwt-auth-context";
import { Save, Trash2, X, Shield, CheckCircle, AlertTriangle } from "lucide-react";

// Using shared schema from @shared/schema

interface TrailCreationSidebarProps {
  points: TrailPoint[];
  onSubmit: (data: TrailFormData) => void;
  onClearTrail: () => void;
  onRemovePoint: (index: number) => void;
  isSubmitting: boolean;
}

export function TrailCreationSidebar({
  points,
  onSubmit,
  onClearTrail,
  onRemovePoint,
  isSubmitting,
}: TrailCreationSidebarProps) {
  const { isAuthenticated } = useJWTAuth();
  
  const form = useForm<TrailFormData>({
    resolver: zodResolver(trailFormSchema),
    defaultValues: {
      name: "",
      description: "",
      country: "",
      city: "",
      distance: 0,
      approximateTime: 0,
      isActive: true,
    },
  });

  const calculateDistance = (points: TrailPoint[]): number => {
    if (points.length < 2) return 0;
    
    let total = 0;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      
      // Haversine formula for distance calculation
      const R = 6371e3; // Earth's radius in meters
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

  const estimatedDistance = calculateDistance(points);
  const progressPercentage = points.length > 0 ? Math.min((points.length / 10) * 100, 100) : 0;

  const handleSubmit = (data: TrailFormData) => {
    if (points.length < 2) {
      form.setError("root", { message: "At least 2 points are required to create a trail" });
      return;
    }
    onSubmit(data);
  };

  return (
    <div className="w-96 bg-white border-r border-gray-200 overflow-y-auto">
      <div className="p-6">
        {/* Trail Creation Status */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Create New Trail</h2>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-secondary rounded-full"></div>
              <span className="text-sm text-gray-500">Active</span>
            </div>
          </div>
          
          {/* Authentication Status */}
          <Card className={`p-3 mb-4 ${isAuthenticated ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'}`}>
            <div className="flex items-center gap-2">
              {isAuthenticated ? (
                <>
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">JWT Authenticated</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 text-orange-600" />
                  <span className="text-sm font-medium text-orange-800">JWT Token Required</span>
                </>
              )}
            </div>
            {!isAuthenticated && (
              <p className="text-xs text-orange-700 mt-1">
                Set your JWT token in the header to submit trails
              </p>
            )}
          </Card>
          
          {/* Progress Indicator */}
          <div className="bg-gray-100 rounded-full h-2 mb-3">
            <div 
              className="bg-primary rounded-full h-2 transition-all duration-300" 
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600">
            {points.length} points added • {(estimatedDistance / 1000).toFixed(1)} km
          </p>
        </div>

        {/* Trail Information Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-md font-medium text-gray-900">Trail Information</h3>
              
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Trail Name *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., Альфа-Битца 10" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        rows={3}
                        placeholder="Describe your trail..." 
                        className="resize-none"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Location Information */}
            <div className="space-y-4">
              <h3 className="text-md font-medium text-gray-900">Location</h3>
              
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <FormControl>
                        <Input placeholder="Russia" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder="Moscow" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Trail Metrics */}
            <div className="space-y-4">
              <h3 className="text-md font-medium text-gray-900">Trail Metrics</h3>
              
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="distance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Distance (m)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="10100" 
                          {...field}
                          value={estimatedDistance || field.value}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="approximateTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Time (minutes)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="90" 
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value) * 60000)} // Convert to milliseconds
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Trail Status */}
            <div className="space-y-4">
              <h3 className="text-md font-medium text-gray-900">Status</h3>
              
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="text-sm font-normal">
                      Trail is active
                    </FormLabel>
                  </FormItem>
                )}
              />
            </div>

            {form.formState.errors.root && (
              <div className="text-sm text-red-600">
                {form.formState.errors.root.message}
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3 pt-4 border-t border-gray-200">
              <Button 
                type="submit" 
                className="w-full"
                disabled={isSubmitting || points.length < 2 || !isAuthenticated}
                variant={!isAuthenticated ? "secondary" : "default"}
              >
                {!isAuthenticated ? (
                  <>
                    <Shield className="w-4 h-4 mr-2" />
                    JWT Token Required
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {isSubmitting ? "Creating..." : "Create Trail"}
                  </>
                )}
              </Button>
              
              {!isAuthenticated && (
                <p className="text-xs text-center text-gray-500">
                  Click "JWT Auth" in the header to set your authentication token
                </p>
              )}
              
              <Button 
                type="button" 
                variant="outline"
                className="w-full"
                onClick={onClearTrail}
                disabled={isSubmitting}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear Trail
              </Button>
            </div>
          </form>
        </Form>

        {/* Trail Points List */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-md font-medium text-gray-900">Trail Points</h3>
            <span className="text-sm text-gray-500">
              {points.length} points
            </span>
          </div>
          
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {points.map((point, index) => {
              const isStart = index === 0;
              const isEnd = index === points.length - 1 && points.length > 1;
              
              return (
                <Card key={point.id} className="p-3 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium ${
                        isStart ? 'bg-green-500' : isEnd ? 'bg-red-500' : 'bg-primary'
                      }`}>
                        {isEnd ? '🏁' : index + 1}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {point.lat.toFixed(4)}, {point.lon.toFixed(4)}
                        </p>
                        <p className="text-xs text-gray-500">
                          Alt: {Math.round(point.altitude)}m
                          {isEnd && " • End Point"}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-400 hover:text-red-500 h-6 w-6 p-0"
                      onClick={() => onRemovePoint(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              );
            })}
            
            {points.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p className="text-sm">No points added yet</p>
                <p className="text-xs">Click on the map to start creating your trail</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
