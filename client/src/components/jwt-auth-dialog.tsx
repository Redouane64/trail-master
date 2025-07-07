import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Key, Shield, CheckCircle, AlertCircle, Copy, Trash2 } from "lucide-react";

interface JWTAuthDialogProps {
  onTokenChange: (token: string | null) => void;
  currentToken: string | null;
}

export function JWTAuthDialog({ onTokenChange, currentToken }: JWTAuthDialogProps) {
  const [open, setOpen] = useState(false);
  const [token, setToken] = useState("");
  const [isValidToken, setIsValidToken] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setToken(currentToken || "");
    setIsValidToken(!!currentToken);
  }, [currentToken]);

  const validateJWT = (token: string): boolean => {
    if (!token) return false;
    
    // Basic JWT structure validation (header.payload.signature)
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    
    try {
      // Try to decode the header and payload to verify they're valid base64
      const header = JSON.parse(atob(parts[0].replace(/-/g, '+').replace(/_/g, '/')));
      const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
      
      // Check if it has the basic JWT structure
      return !!(header.typ && payload);
    } catch {
      return false;
    }
  };

  const handleTokenChange = (newToken: string) => {
    setToken(newToken);
    const isValid = validateJWT(newToken);
    setIsValidToken(isValid);
  };

  const handleSaveToken = () => {
    if (!token.trim()) {
      onTokenChange(null);
      localStorage.removeItem('jwt_token');
      toast({
        title: "Token Removed",
        description: "JWT token has been cleared.",
      });
    } else if (isValidToken) {
      onTokenChange(token.trim());
      localStorage.setItem('jwt_token', token.trim());
      toast({
        title: "Token Saved",
        description: "JWT token has been saved successfully.",
      });
    } else {
      toast({
        title: "Invalid Token",
        description: "Please enter a valid JWT token.",
        variant: "destructive",
      });
      return;
    }
    setOpen(false);
  };

  const handleClearToken = () => {
    setToken("");
    setIsValidToken(false);
    onTokenChange(null);
    localStorage.removeItem('jwt_token');
    toast({
      title: "Token Cleared",
      description: "JWT token has been removed.",
    });
  };

  const copyExampleToken = () => {
    const exampleToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
    setToken(exampleToken);
    handleTokenChange(exampleToken);
    navigator.clipboard.writeText(exampleToken);
    toast({
      title: "Example Token Copied",
      description: "Example JWT token has been pasted and copied to clipboard.",
    });
  };

  const getTokenPreview = (token: string): string => {
    if (!token) return "";
    if (token.length <= 50) return token;
    return `${token.substring(0, 20)}...${token.substring(token.length - 20)}`;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="relative">
          <Key className="w-4 h-4 mr-2" />
          JWT Auth
          {currentToken && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full flex items-center justify-center">
              <CheckCircle className="w-2 h-2 text-white" />
            </div>
          )}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            JWT Authentication
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Current Status */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                {currentToken ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Token Active
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 text-orange-500" />
                    No Token Set
                  </>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {currentToken ? (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    Current token: <code className="text-xs bg-gray-100 px-1 rounded">
                      {getTokenPreview(currentToken)}
                    </code>
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleClearToken}
                    className="w-full"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear Token
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-gray-600">
                  No JWT token is currently set. Trail submissions will fail without authentication.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Token Input */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="jwt-token">JWT Token</Label>
              <div className="space-y-2">
                <Textarea
                  id="jwt-token"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={token}
                  onChange={(e) => handleTokenChange(e.target.value)}
                  className="font-mono text-xs"
                  rows={4}
                />
                
                {/* Token validation indicator */}
                <div className="flex items-center gap-2 text-sm">
                  {token && (
                    <>
                      {isValidToken ? (
                        <>
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-green-600">Valid JWT format</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-4 h-4 text-red-500" />
                          <span className="text-red-600">Invalid JWT format</span>
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Example Token Button */}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={copyExampleToken}
              className="w-full text-xs"
            >
              <Copy className="w-3 h-3 mr-2" />
              Use Example Token (for testing)
            </Button>
          </div>

          {/* Help Text */}
          <Card className="bg-blue-50">
            <CardContent className="pt-4">
              <div className="text-sm space-y-2">
                <p className="font-medium text-blue-900">How to get your JWT token:</p>
                <ul className="text-blue-800 space-y-1 list-disc list-inside">
                  <li>Contact your backend administrator</li>
                  <li>Use your authentication service</li>
                  <li>Generate from your API dashboard</li>
                  <li>Use the example token for testing</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button onClick={handleSaveToken} className="flex-1">
              <Shield className="w-4 h-4 mr-2" />
              Save Token
            </Button>
            <Button variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}