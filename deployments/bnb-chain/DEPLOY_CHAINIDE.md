# Deploy SYNAPEX $SYNX na BNB Chain — ChainIDE

## BEP20 vs BRC20 — ważne

| Standard | Sieć | Opis |
|----------|------|------|
| **BEP20** | BNB Chain (BSC) | Standard tokenów na BNB Chain. **Kompatybilny z ERC20** — te same interfejsy. Nasze kontrakty po deployu na BNB Chain są tokenami BEP20. |
| **BRC20** | Bitcoin | Standard tokenów (Ordinals). Zupełnie inny protokół — nie używamy. |
| **ERC20** | Ethereum | Ten sam interfejs co BEP20. Kontrakty EVM działają na obu sieciach. |

**Nasze kontrakty są przygotowane pod BNB Chain i działają jako BEP20.**

---

## Metoda A: EVM Sandbox + Hardhat (zalecana)

ChainIDE ma **BNB Chain EVM Sandbox** z Hardhat, Node.js, npm. Użyj tego do pełnego deployu jedną komendą.

### Krok 1: Wejście na ChainIDE

1. Otwórz [chainide.com](https://chainide.com)
2. Zaloguj się (załóż konto)
3. Utwórz nowy projekt lub wybierz **BNB Chain** / **BSC IDE**

### Krok 2: Otwarcie EVM Sandbox (terminal)

1. W menu projektu znajdź opcję **EVM Sandbox**, **Terminal** lub **Console**
2. Otwórz terminal (zwykle w dolnej części ekranu)
3. Upewnij się, że jesteś w katalogu projektu

### Krok 3: Wgranie plików

**Opcja A — Import z Git**

- Jeśli ChainIDE ma „Import from Git”: wklej URL repozytorium
- Po imporcie przejdź do `deployments/bnb-chain/`

**Opcja B — Ręczne utworzenie plików**

1. W panelu Explorer utwórz strukturę:
   ```
   deployments/bnb-chain/
   ├── contracts/
   ├── scripts/
   ├── hardhat.config.js
   └── package.json
   ```
2. Skopiuj zawartość z repozytorium:
   - `contracts/SYNXToken.sol`, `FeeBurner.sol`, `GovernanceGuard.sol`, `SYNXVesting.sol`
   - `scripts/deploy.js`
   - `hardhat.config.js`
   - `package.json`

### Krok 4: Instalacja zależności

W terminalu:

```bash
cd deployments/bnb-chain
npm install
```

### Krok 5: Kompilacja

```bash
npx hardhat compile
```

Powinna pojawić się informacja o sukcesie kompilacji. Ewentualne błędy sprawdź w logach.

### Krok 6: MetaMask + BNB Testnet

1. Otwórz MetaMask
2. Sieć → „Dodaj sieć” → „Dodaj sieć ręcznie”
3. Wpisz:
   - **Nazwa sieci:** BNB Smart Chain Testnet
   - **URL RPC:** `https://bsc-testnet.bnbchain.org`
   - **Identyfikator łańcucha:** 97
   - **Symbol:** tBNB
   - **Explorer:** `https://testnet.bscscan.com`
4. Zapisz sieć i przełącz się na BNB Testnet
5. Zdobądź tBNB z [faucet BNB Chain](https://www.bnbchain.org/en/testnet-faucet)

### Krok 7: Ustawienie klucza prywatnego

W terminalu ChainIDE (tylko na testnecie, używaj testowego portfela):

```bash
export PRIVATE_KEY="0xTWOJ_KLUCZ_PRYWATNY_Z_METAMASK"
```

Ważne: użyj portfela testowego, nie głównego.

### Krok 8: Deploy na testnet

```bash
npx hardhat run scripts/deploy.js --network bnb-testnet
```

Skrypt zdeployuje w kolejności:
1. SYNXToken  
2. FeeBurner  
3. GovernanceGuard  
4. SYNXVesting (przykładowy, 10M tokenów, 6 miesięcy)

### Krok 9: Zapis adresów

Po deployu w konsoli zobaczysz coś w stylu:

```
--- Deployment Summary ---
SYNXToken:        0x1234...
FeeBurner:        0x5678...
GovernanceGuard:  0x9abc...
SYNXVesting:     0xdef0...
-------------------------
```

Zapisz te adresy do konfiguracji platformy.

### Krok 10: Weryfikacja na BSCScan (opcjonalnie)

1. Wejdź na [testnet.bscscan.com](https://testnet.bscscan.com)
2. Wyszukaj adres kontraktu
3. Zakładka „Contract” → „Verify & Publish”

---

## Metoda B: Prosty interfejs ChainIDE (Compile + Deploy)

Jeśli korzystasz z trybu Remix-like (Compile, Deploy & Interaction):

### Krok 1: Nowy projekt BSC

1. Otwórz ChainIDE → Nowy projekt → BNB Chain / BSC

### Krok 2: Wgranie kontraktów

1. W panelu plików utwórz pliki `.sol`
2. Wklej kod z `contracts/` (SYNXToken, FeeBurner, GovernanceGuard, SYNXVesting)
3. Jeśli ChainIDE ma plugin NPM/Import:
   - Zainstaluj `@openzeppelin/contracts`
   - Importy `@openzeppelin/contracts/...` będą działać
4. Jeśli nie ma NPM, użyj Metody A (EVM Sandbox). Alternatywnie w projekcie Hardhat uruchom `npx hardhat flatten contracts/SYNXToken.sol > SYNXToken_flat.sol` i wklej wynik do nowego pliku w ChainIDE.

### Krok 3: Compiler

1. Kliknij **Compiler** (ikona kompilatora)
2. Wybierz Solidity **0.8.20**
3. Włącz optimizer, runs: 200
4. Kliknij **Compile**

### Krok 4: Deploy po jednym kontrakcie

1. Kliknij **Deploy & Interaction**
2. Połącz portfel (MetaMask, sieć BNB Testnet)
3. Deployuj po kolei:

| # | Kontrakt      | Parametry konstruktora |
|---|---------------|-------------------------|
| 1 | SYNXToken    | (brak) |
| 2 | FeeBurner    | `synxAddress` = adres SYNXToken z kroku 1 |
| 3 | GovernanceGuard | `synxAddress` = adres SYNXToken, `owner` = Twój adres |
| 4 | SYNXVesting  | `token`, `beneficiary`, `totalAllocation`, `tgeBasisPoints`, `cliffMonths`, `vestingMonths` |

4. Dla SYNXVesting po deployu wyślij tokeny na adres kontraktu vestingu (`transfer` z SYNXToken)

### Krok 5: Połączenie portfela

1. W prawym górnym rogu kliknij **Connect Wallet**
2. Wybierz MetaMask
3. Sieć: BNB Smart Chain Testnet (Chain ID 97)
4. Upewnij się, że masz tBNB na gaz

---

## Parametry BNB Chain

| Sieć      | Chain ID | RPC URL |
|-----------|----------|---------|
| Testnet   | 97       | `https://bsc-testnet.bnbchain.org` |
| Mainnet   | 56       | `https://bsc-dataseed.bnbchain.org` |

---

## Deploy na mainnet

Po testach na testnecie:

```bash
npx hardhat run scripts/deploy.js --network bnb-mainnet
```

Używaj dedykowanego, bezpiecznego portfela. Nie udostępniaj klucza prywatnego.

---

## Rozwiązywanie problemów

| Problem | Rozwiązanie |
|--------|-------------|
| Brak środków | Faucet BNB Chain → tBNB |
| Błąd kompilacji | `npm install`, sprawdź Solidity 0.8.20 |
| „Nonce too high” | Zresetuj konto w MetaMask lub poczekaj na transakcje |
| Brak OpenZeppelin | Użyj EVM Sandbox (Metoda A) z `npm install` |
