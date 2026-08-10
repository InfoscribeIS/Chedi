import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // En local, la page appelle /api/* sur sa propre adresse et Next relaie vers
  // le backend en interne : plus aucun souci de CORS, d'IPv6 ou de pare-feu
  // entre deux origines localhost. En production (NEXT_PUBLIC_API_URL défini),
  // le client appelle l'API directement et ce relais n'est pas utilisé.
  rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://127.0.0.1:8000/api/:path*",
      },
    ];
  },
};

export default nextConfig;
