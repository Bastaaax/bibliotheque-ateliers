import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/components/ui/use-toast'

const signupSchema = z
  .object({
    email: z.string().email('Email invalide'),
    password: z.string().min(6, 'Le mot de passe doit faire au moins 6 caractères'),
    confirmPassword: z.string(),
    fullName: z.string().min(1, 'Le nom est requis'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  })

type SignupFormValues = z.infer<typeof signupSchema>

export function SignupForm() {
  const { signUp } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { email: '', password: '', confirmPassword: '', fullName: '' },
  })

  const onSubmit = form.handleSubmit(async (values) => {
    setIsLoading(true)
    try {
      await signUp.mutateAsync({
        email: values.email,
        password: values.password,
        fullName: values.fullName,
      })
      toast({
        title: 'Inscription réussie',
        description: 'Vérifiez votre email pour confirmer votre compte.',
      })
    } catch (err) {
      toast({
        title: 'Erreur',
        description: err instanceof Error ? err.message : 'Impossible de créer le compte.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  })

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-4">
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom complet</FormLabel>
              <FormControl>
                <Input placeholder="Jean Dupont" autoComplete="name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="vous@exemple.fr" autoComplete="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mot de passe</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirmer le mot de passe</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Inscription...' : "S'inscrire"}
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          Déjà un compte ?{' '}
          <Link to="/login" className="text-primary hover:underline">
            Se connecter
          </Link>
        </p>
      </form>
    </Form>
  )
}
