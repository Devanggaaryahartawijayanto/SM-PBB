# Laporan Source Code Kunci - Proyek IPBB

Dokumen ini adalah tur berpemandu melalui potongan-potongan kode paling penting dan representatif dari proyek IPBB. Tujuannya adalah untuk memberikan pemahaman cepat tentang bagaimana komponen-komponen utama diimplementasikan dan bagaimana mereka saling berinteraksi.

## Bagian 1: Backend (FastAPI)

Backend adalah otak dari aplikasi, menangani semua logika bisnis, otentikasi, dan interaksi database.

### 1.1. Titik Masuk Aplikasi (`backend/app/main.py`)

Ini adalah file utama yang menginisialisasi aplikasi FastAPI. Perannya adalah mengkonfigurasi middleware (seperti CORS) dan yang terpenting, **menggabungkan semua router** dari modul-modul yang berbeda. Ini menunjukkan arsitektur modular di mana setiap set endpoint (auth, sppt, profile) dikelola dalam filenya sendiri.

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.utils import get_openapi
from app.core.utils import simple_generate_unique_route_id

from app.auth.router import router as auth_router
from app.sppt.router import router as sppt_router
from app.routes.profile import router as profile_router
from app.routes.dashboard import router as dashboard_router
from app.core.config import settings

app = FastAPI(
    openapi_url=settings.OPENAPI_URL,
    generate_unique_id_function=simple_generate_unique_route_id,
)

# Middleware for CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router, prefix="/auth")
app.include_router(sppt_router, prefix="/op")
app.include_router(profile_router, prefix="/profile")
app.include_router(dashboard_router)  # Dashboard router already has prefix
```

---

### 1.2. Model Database (`backend/app/models/user.py`)

File ini mendefinisikan struktur tabel `ipbb_user` menggunakan **SQLModel**. SQLModel menggabungkan Pydantic dan SQLAlchemy, memungkinkan kita untuk mendefinisikan model data, tabel database, dan skema validasi dalam satu kelas. Perhatikan penggunaan tipe data seperti `EmailStr` untuk validasi otomatis.

```python
import datetime
import uuid
from pydantic import EmailStr
from sqlmodel import SQLModel, Field


class UserBase(SQLModel):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    email: EmailStr = Field(unique=True, index=True, max_length=255)
    nama: str | None = Field(default=None, max_length=255)
    telepon: str = Field(default="")
    alamat: str = Field(default="")
    is_active: bool = False
    is_verified: bool = False


class User(UserBase, table=True):
    __tablename__ = "ipbb_user"
    password: str = Field(min_length=8)
    created_at: datetime.datetime = Field(default_factory=datetime.datetime.now)
    updated_at: datetime.datetime = Field(default_factory=datetime.datetime.now)
```

---

### 1.3. Dependency Injection (`backend/app/core/deps.py`)

Ini adalah inti dari desain modular FastAPI. File ini mendefinisikan "dependensi" yang dapat di-inject ke dalam fungsi-fungsi endpoint. `SessionDep` menyediakan sesi database yang dikelola secara otomatis, sementara `get_token` mengekstrak token otentikasi dari header request. Ini memisahkan logika koneksi database dan otentikasi dari logika bisnis endpoint.

```python
from typing import Annotated

from fastapi import Depends, HTTPException
from fastapi.security import (
    HTTPAuthorizationCredentials,
    OAuth2PasswordBearer,
    HTTPBearer,
)
from sqlmodel.ext.asyncio.session import AsyncSession
from app.core.config import settings
from app.core.database import get_async_session

# reusable_oauth2 = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"/auth/login")
http_bearer = HTTPBearer(auto_error=False)

SessionDep = Annotated[AsyncSession, Depends(get_async_session)]
TokenDep = Annotated[str, Depends(oauth2_scheme)]


async def get_token(
    oauth_token: str = Depends(oauth2_scheme),
    bearer_creds: HTTPAuthorizationCredentials = Depends(http_bearer),
) -> str:
    if bearer_creds and bearer_creds.scheme.lower() == "bearer":
        return bearer_creds.credentials
    if oauth_token:
        return oauth_token
    raise HTTPException(status_code=401, detail="Not authenticated")
```

---

### 1.4. Logika Bisnis & Layanan (`backend/app/auth/service.py`)

File ini berisi logika bisnis inti yang terpisah dari router. Fungsi seperti `get_current_user`, `create_user`, dan `authenticate` melakukan pekerjaan berat: mendekode token, memeriksa kredensial, dan berinteraksi dengan database untuk mengambil atau membuat pengguna. Memisahkan ini ke dalam "service layer" membuat kode lebih bersih dan mudah diuji.

```python
from uuid import UUID
from fastapi import Depends, HTTPException
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select

from app.core import security
from app.core.database import get_async_session
from app.core.deps import SessionDep, get_token
from .schemas import RegisterRequest, TokenPayload
from .exceptions import user_already_exists_exception, credentials_exception
from app.models.user import User

# ... (get_user_by_email, get_user)

async def get_current_user(
    session: SessionDep,
    token: str = Depends(get_token),
) -> User:
    return await get_user(session=session, token=token, require_active=True)

# ...

async def create_user(*, session: AsyncSession, register: RegisterRequest) -> User:
    if await get_user_by_email(session=session, email=register.email):
        raise user_already_exists_exception()

    db_user = User.model_validate(
        register, update={"password": security.hash_password(register.password)}
    )
    session.add(db_user)
    await session.commit()
    await session.refresh(db_user)
    return db_user


async def authenticate(
    *, session: AsyncSession, email: str, password: str
) -> User | None:
    db_user = await get_user_by_email(session=session, email=email)
    if not db_user or not security.verify_password(password, db_user.password):
        raise credentials_exception()
    return db_user
```

---

### 1.5. Contoh Endpoint API (`backend/app/routes/dashboard.py`)

Ini adalah contoh sempurna bagaimana semua bagian disatukan. Router ini mendefinisikan endpoint `/api/dashboard/stats`. Perhatikan bagaimana ia menggunakan `Depends`:
-   `session: SessionDep`: Secara otomatis mendapatkan sesi database.
-   `current_user: User = Depends(get_current_user)`: Secara otomatis mendapatkan token, memvalidasinya, dan mengambil data pengguna yang login. Jika token tidak valid, fungsi ini bahkan tidak akan pernah dijalankan.

```python
from fastapi import APIRouter, Depends
from sqlmodel import select, func
from app.core.deps import SessionDep, get_token
from app.auth.service import get_current_user
from app.models.sppt import Sppt
from app.models.user import User

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("/stats")
async def get_dashboard_stats(
    session: SessionDep,
    current_user: User = Depends(get_current_user),
):
    # Get total SPPT count
    total_sppt = await session.scalar(
        select(func.count()).select_from(Sppt)
    )
    # ... (more queries)

    return {
        "total_sppt": total_sppt or 0,
        "total_sppt_lunas": total_sppt_lunas or 0,
        "total_sppt_belum_lunas": total_sppt_belum_lunas or 0,
        "total_pbb_terhutang": float(total_pbb_terhutang or 0),
    }
```

## Bagian 2: Frontend (Next.js)

Frontend bertanggung jawab untuk menyajikan antarmuka pengguna yang interaktif dan menarik, sambil berkomunikasi secara efisien dengan backend.

### 2.1. Konfigurasi Sinkronisasi API (`frontend/orval.config.ts`)

Ini adalah salah satu file paling penting untuk menjaga kewarasan pengembang. Ini mengkonfigurasi **Orval**, alat yang secara otomatis menghasilkan klien API TypeScript dari file `openapi.json` backend. Ini memastikan bahwa frontend dan backend selalu sinkron. Jika backend mengubah endpoint, frontend akan mengalami error saat build, bukan saat runtime.

```typescript
import { defineConfig } from "orval";

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000"
const defaultQueryOverride = {
  useQuery: true,
  signal: true,
  useSuspenseQuery: true,
};

export default defineConfig({
  app: {
    input: {
      target: `${baseURL}/openapi.json`,
      filters: {
        tags: [/^(?!.*healthcheck).*$/],
      },
    },
    output: {
      clean: true,
      mode: "tags-split",
      workspace: ".",
      target: "./services/api/endpoints",
      schemas: "./services/api/models",
      indexFiles: true,
      client: "swr",
      mock: false,
      override: {
        mutator: {
          path: "./lib/orval/mutator.ts",
          name: "clientFetcher",
        },
      },
    },
  },
  // ...
});
```

---

### 2.2. Middleware untuk Otentikasi (`frontend/middleware.ts`)

Middleware berjalan di server sebelum permintaan diteruskan ke halaman. File ini sangat penting untuk keamanan. Ia memeriksa cookie `token` pada setiap permintaan ke rute yang dilindungi (seperti `/dashboard`). Jika token tidak ada, ia akan mengalihkan pengguna ke halaman `/login`, secara efektif melindungi halaman-halaman internal.

```typescript
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;

  const pathname = request.nextUrl.pathname;

    // Redirect "/" based on auth
    if (pathname === "/") {
      const redirectUrl = token ? "/dashboard" : "/login";
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }

    // Optional: protect /dashboard
    if (pathname.startsWith("/dashboard") && !token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/dashboard"],
};
```

---

### 2.3. Halaman Dashboard (`frontend/app/dashboard/page.tsx`)

Ini adalah contoh halaman yang menggunakan **Client Component** (`"use client"`) di Next.js App Router.
-   `useAuthMeWithRedirect()`: Custom hook yang memeriksa otentikasi di sisi klien.
-   `useGetDashboardStats()`: Ini adalah hook yang **dihasilkan oleh Orval**. Ia secara otomatis menangani pemanggilan API ke endpoint `/api/dashboard/stats`, manajemen state (loading, error), dan caching. Ini membuat kode komponen menjadi sangat bersih dan fokus pada presentasi.

```typescript
"use client"

import { useAuthMeWithRedirect } from "../hooks/use-auth-me"
import { useGetDashboardStats } from "../api/endpoints/dashboard/dashboard"
import { AppSidebar } from "@/components/app-sidebar"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { DataTable } from "@/components/data-table"
import { SectionCards } from "@/components/section-cards"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { SiteHeader } from "@/components/site-header"

export default function Page() {
  useAuthMeWithRedirect()
  const { data: stats, isLoading } = useGetDashboardStats()

  return (
    <SidebarProvider
      // ...
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title="Profil Wajib Pajak" />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
              <div className="h-full px-4 py-6 lg:px-6">
                <SectionCards isLoading={isLoading} stats={stats} />
                {/* <ChartAreaInteractive /> */}
                {/* <DataTable /> */}
              </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
```

---

### 2.4. Custom Hook (`frontend/hooks/use-debounce.ts`)

Custom hooks adalah cara standar di React untuk mengekstrak dan menggunakan kembali logika stateful. `useDebounce` adalah contoh klasik dan sangat berguna. Ini mengambil sebuah nilai (misalnya, dari input pencarian) dan hanya memperbaruinya setelah pengguna berhenti mengetik selama periode waktu tertentu (delay). Ini mencegah pemanggilan API yang berlebihan pada setiap ketukan tombol.

```typescript
import { useEffect, useState } from "react";

export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
```

---

### 2.5. Komponen Kompleks (`frontend/components/data-table.tsx`)

File ini menunjukkan bagaimana komponen UI yang kompleks dan kaya fitur dibangun. Ini menggunakan **TanStack Table** untuk membuat tabel data yang dapat diurutkan, difilter, dan memiliki paginasi. Selain itu, ia mengintegrasikan **dnd-kit** untuk fungsionalitas drag-and-drop baris dan komponen UI dari **shadcn/ui** (seperti `DropdownMenu`, `Drawer`, `Checkbox`). Ini adalah contoh bagus dari komposisi komponen untuk menciptakan pengalaman pengguna yang canggih.

```typescript
"use client"

// ... (imports)
import {
  type ColumnDef,
  // ...
  useReactTable,
} from "@tanstack/react-table"
import {
  DndContext,
  // ...
} from "@dnd-kit/core"
import {
  SortableContext,
  // ...
} from "@dnd-kit/sortable"

// ...

export function DataTable({
  data: initialData,
}: {
  data: z.infer<typeof schema>[]
}) {
  const [data, setData] = React.useState(() => initialData)
  // ... (many states for table features)

  const table = useReactTable({
    data,
    columns,
    state: {
      // ...
    },
    // ... (event handlers)
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    // ...
  })

  function handleDragEnd(event: DragEndEvent) {
    // ... logic to reorder data
  }

  return (
    <Tabs defaultValue="outline" className="w-full flex-col justify-start gap-6">
      {/* ... Toolbar, Column visibility toggle, etc. */}
      <div className="overflow-hidden rounded-lg border">
        <DndContext
          // ...
        >
          <Table>
            <TableHeader>
              {/* ... */}
            </TableHeader>
            <TableBody>
              <SortableContext items={dataIds} strategy={verticalListSortingStrategy}>
                {table.getRowModel().rows.map((row) => (
                  <DraggableRow key={row.id} row={row} />
                ))}
              </SortableContext>
            </TableBody>
          </Table>
        </DndContext>
      </div>
      {/* ... Pagination controls */}
    </Tabs>
  )
}
```
