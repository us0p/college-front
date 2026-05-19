import Link from 'next/link'
import { GraduationCap, Mail, Phone, MapPin } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t border-border bg-primary text-primary-foreground">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Logo e Descrição */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
                <GraduationCap className="h-6 w-6 text-accent-foreground" />
              </div>
              <span className="text-lg font-bold">Mural Universitário</span>
            </Link>
            <p className="text-sm text-primary-foreground/80">
              Seu portal de informações acadêmicas. Fique por dentro de eventos,
              oportunidades de estágio e anúncios importantes.
            </p>
          </div>

          {/* Links Rápidos */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider">
              Links Rápidos
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/blog"
                  className="text-sm text-primary-foreground/80 transition-colors hover:text-accent"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href="/documentos"
                  className="text-sm text-primary-foreground/80 transition-colors hover:text-accent"
                >
                  Documentos
                </Link>
              </li>
              <li>
                <Link
                  href="/login"
                  className="text-sm text-primary-foreground/80 transition-colors hover:text-accent"
                >
                  Área do Aluno
                </Link>
              </li>
            </ul>
          </div>

          {/* Categorias */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider">
              Categorias
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/blog?categoria=eventos"
                  className="text-sm text-primary-foreground/80 transition-colors hover:text-accent"
                >
                  Eventos
                </Link>
              </li>
              <li>
                <Link
                  href="/blog?categoria=estagios"
                  className="text-sm text-primary-foreground/80 transition-colors hover:text-accent"
                >
                  Estágios
                </Link>
              </li>
              <li>
                <Link
                  href="/blog?categoria=anuncios"
                  className="text-sm text-primary-foreground/80 transition-colors hover:text-accent"
                >
                  Anúncios
                </Link>
              </li>
              <li>
                <Link
                  href="/blog?categoria=noticias"
                  className="text-sm text-primary-foreground/80 transition-colors hover:text-accent"
                >
                  Notícias
                </Link>
              </li>
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider">
              Contato
            </h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-primary-foreground/80">
                <Mail className="h-4 w-4 text-accent" />
                contato@mural.edu.br
              </li>
              <li className="flex items-center gap-2 text-sm text-primary-foreground/80">
                <Phone className="h-4 w-4 text-accent" />
                (11) 3000-0000
              </li>
              <li className="flex items-start gap-2 text-sm text-primary-foreground/80">
                <MapPin className="h-4 w-4 shrink-0 text-accent" />
                Av. Universitária, 1000
                <br />
                São Paulo - SP
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 border-t border-primary-foreground/20 pt-8">
          <p className="text-center text-sm text-primary-foreground/60">
            &copy; {new Date().getFullYear()} Mural Universitário. Todos os
            direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}
