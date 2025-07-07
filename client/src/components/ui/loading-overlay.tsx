import { Card } from "./card";

interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
}

export function LoadingOverlay({ isVisible, message = "Loading..." }: LoadingOverlayProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="p-8 max-w-sm w-full mx-4">
        <div className="text-center">
          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Creating Trail</h3>
          <p className="text-gray-600 text-sm">{message}</p>
        </div>
      </Card>
    </div>
  );
}
