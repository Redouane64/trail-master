import { TrailPoint } from "@shared/schema";

export interface GraphQLTrailInput {
  name: string;
  location: {
    country: string;
    city: string;
    point: { lat: number; lon: number };
    title: string | null;
  };
  track: {
    points: TrailPoint[];
  };
  description: string;
  isActive: boolean;
  distance: number;
  approximateTime: number;
  imagesIds: string[];
  availableDisciplinesIds: string[];
  allowedForStartingDisciplinesIds: string[];
}

export function generateCreateTrailMutation(input: GraphQLTrailInput): string {
  return `
    mutation CreateTrail {
      createTrail(
        name: "${input.name}"
        location: {
          country: "${input.location.country}"
          city: "${input.location.city}"
          point: { lat: ${input.location.point.lat}, lon: ${input.location.point.lon} }
          title: ${input.location.title ? `"${input.location.title}"` : "null"}
        }
        track: {
          points: ${JSON.stringify(input.track.points)}
        }
        description: "${input.description}"
        isActive: ${input.isActive}
        distance: ${input.distance}
        approximateTime: ${input.approximateTime}
        imagesIds: ${JSON.stringify(input.imagesIds)}
        availableDisciplinesIds: ${JSON.stringify(input.availableDisciplinesIds)}
        allowedForStartingDisciplinesIds: ${JSON.stringify(input.allowedForStartingDisciplinesIds)}
      ) {
        id
        name
        description
        htmlDescription
        isActive
        track {
          image {
            url
          }
        }
        created
        updated
        availableDisciplines {
          name
        }
      }
    }
  `;
}

export async function submitTrailToGraphQL(input: GraphQLTrailInput, jwtToken?: string): Promise<any> {
  const mutation = generateCreateTrailMutation(input);
  
  // In a real implementation, you would send this to your GraphQL endpoint
  // For demonstration, we'll simulate the submission with JWT validation
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Check for JWT token
      if (!jwtToken) {
        reject(new Error("JWT token is required for authentication"));
        return;
      }
      
      // Basic JWT format validation
      const parts = jwtToken.split('.');
      if (parts.length !== 3) {
        reject(new Error("Invalid JWT token format"));
        return;
      }
      
      try {
        // Decode and validate the token structure
        const header = JSON.parse(atob(parts[0].replace(/-/g, '+').replace(/_/g, '/')));
        const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
        
        if (!header.typ || !payload) {
          reject(new Error("Invalid JWT token structure"));
          return;
        }
        
        // Simulate successful GraphQL submission with JWT
        console.log("GraphQL Mutation to be sent:", mutation);
        console.log("JWT Token used:", jwtToken.substring(0, 20) + "...");
        
        resolve({
          data: {
            createTrail: {
              id: Date.now().toString(),
              name: input.name,
              description: input.description,
              isActive: input.isActive,
              created: new Date().toISOString(),
              updated: new Date().toISOString(),
              track: {
                image: {
                  url: "https://example.com/trail-image.jpg"
                }
              },
              availableDisciplines: [
                { name: "Trail Running" }
              ]
            }
          }
        });
      } catch (error) {
        reject(new Error("Failed to decode JWT token"));
      }
    }, 2000); // Simulate network delay
  });
}

// Helper function to make authenticated GraphQL requests
export async function makeAuthenticatedGraphQLRequest(
  endpoint: string,
  mutation: string,
  jwtToken: string
): Promise<any> {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${jwtToken}`,
    },
    body: JSON.stringify({
      query: mutation,
    }),
  });

  if (!response.ok) {
    throw new Error(`GraphQL request failed: ${response.statusText}`);
  }

  return response.json();
}
