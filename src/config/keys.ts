import fs from "fs";
import path from "path";

export class KeyManager {
  private static privateKey: string | null = null;
  private static publicKey: string | null = null;

  static getPrivateKey(): string {
    if (!this.privateKey) {
      const keyPath = path.join(__dirname, "../keys/private.pem");
      if (!fs.existsSync(keyPath)) {
        throw new Error(
          "Private key not found. Run 'npm run generate-keys' first."
        );
      }
      this.privateKey = fs.readFileSync(keyPath, "utf8");
    }
    return this.privateKey;
  }

  static getPublicKey(): string {
    if (!this.publicKey) {
      const keyPath = path.join(__dirname, "../keys/public.pem");
      if (!fs.existsSync(keyPath)) {
        throw new Error(
          "Public key not found. Run 'npm run generate-keys' first."
        );
      }
      this.publicKey = fs.readFileSync(keyPath, "utf8");
    }
    return this.publicKey;
  }
}
