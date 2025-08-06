'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from '@mui/material'
import { Edit, Delete, Add } from '@mui/icons-material'
import { useAuth } from '@/components/providers/AuthProvider'
import {
  useCars,
  useCreateCar,
  useUpdateCar,
  useDeleteCar,
} from '@/lib/queries/cars'
import { useTranslations } from 'next-intl'
import type { Car } from '@/lib/supabase/types'
import styles from './ProfilePage.module.scss'

interface ProfileFormData {
  display_name: string
  email: string
}

interface CarFormData {
  make: string
  model: string
  year: number
  power: number | null
  description: string
}

export function ProfilePage() {
  const t = useTranslations()
  const { user, dbUser, loading } = useAuth()
  const { data: cars, isLoading: carsLoading } = useCars()
  const createCarMutation = useCreateCar()
  const updateCarMutation = useUpdateCar()
  const deleteCarMutation = useDeleteCar()

  const [carDialogOpen, setCarDialogOpen] = useState(false)
  const [editingCar, setEditingCar] = useState<Car | null>(null)
  const [message, setMessage] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)

  const profileForm = useForm<ProfileFormData>({
    defaultValues: {
      display_name: dbUser?.display_name || '',
      email: dbUser?.email || '',
    },
  })

  const carForm = useForm<CarFormData>({
    defaultValues: {
      make: '',
      model: '',
      year: new Date().getFullYear(),
      power: null,
      description: '',
    },
  })

  useEffect(() => {
    if (dbUser) {
      profileForm.reset({
        display_name: dbUser.display_name || '',
        email: dbUser.email,
      })
    }
  }, [dbUser, profileForm])

  const onProfileSubmit = async (data: ProfileFormData) => {
    // Profile update would be implemented here
    setMessage({ type: 'success', text: 'Profile updated successfully!' })
  }

  const onCarSubmit = async (data: CarFormData) => {
    if (!user) return

    try {
      if (editingCar) {
        await updateCarMutation.mutateAsync({
          id: editingCar.id,
          ...data,
        })
        setMessage({ type: 'success', text: 'Car updated successfully!' })
      } else {
        await createCarMutation.mutateAsync(data)
        setMessage({ type: 'success', text: 'Car added successfully!' })
      }
      handleCloseCarDialog()
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Failed to save car. Please try again.',
      })
    }
  }

  const handleEditCar = (car: Car) => {
    setEditingCar(car)
    carForm.reset({
      make: car.make,
      model: car.model,
      year: car.year,
      power: car.power,
      description: car.description || '',
    })
    setCarDialogOpen(true)
  }

  const handleDeleteCar = async (carId: string) => {
    if (window.confirm('Are you sure you want to delete this car?')) {
      try {
        await deleteCarMutation.mutateAsync(carId)
        setMessage({ type: 'success', text: 'Car deleted successfully!' })
      } catch (error) {
        setMessage({ type: 'error', text: 'Failed to delete car.' })
      }
    }
  }

  const handleCloseCarDialog = () => {
    setCarDialogOpen(false)
    setEditingCar(null)
    carForm.reset({
      make: '',
      model: '',
      year: new Date().getFullYear(),
      power: null,
      description: '',
    })
  }

  if (loading) {
    return <div>{t('common.loading')}</div>
  }

  return (
    <Container maxWidth="lg" className={styles.container}>
      {message && (
        <Alert
          severity={message.type}
          onClose={() => setMessage(null)}
          sx={{ mb: 3 }}
        >
          {message.text}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Profile Section */}
        <Grid item xs={12} md={6}>
          <Paper className={styles.section}>
            <Typography variant="h5" gutterBottom>
              Profile Information
            </Typography>
            <Box
              component="form"
              onSubmit={profileForm.handleSubmit(onProfileSubmit)}
            >
              <TextField
                fullWidth
                label="Display Name"
                {...profileForm.register('display_name')}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Email"
                {...profileForm.register('email')}
                disabled
                margin="normal"
              />
              <Button
                type="submit"
                variant="contained"
                sx={{ mt: 2 }}
                disabled={profileForm.formState.isSubmitting}
              >
                Update Profile
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Cars Section */}
        <Grid item xs={12} md={6}>
          <Paper className={styles.section}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={2}
            >
              <Typography variant="h5">My Cars</Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setCarDialogOpen(true)}
              >
                Add Car
              </Button>
            </Box>

            {carsLoading ? (
              <Typography>{t('common.loading')}</Typography>
            ) : cars && cars.length > 0 ? (
              <Box className={styles.carsList}>
                {cars.map((car) => (
                  <Card key={car.id} className={styles.carCard}>
                    <CardContent>
                      <Typography variant="h6">
                        {car.make} {car.model}
                      </Typography>
                      <Typography color="text.secondary">
                        Year: {car.year}
                      </Typography>
                      {car.power && (
                        <Typography color="text.secondary">
                          Power: {car.power} HP
                        </Typography>
                      )}
                      {car.description && (
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          {car.description}
                        </Typography>
                      )}
                    </CardContent>
                    <CardActions>
                      <IconButton onClick={() => handleEditCar(car)}>
                        <Edit />
                      </IconButton>
                      <IconButton onClick={() => handleDeleteCar(car.id)}>
                        <Delete />
                      </IconButton>
                    </CardActions>
                  </Card>
                ))}
              </Box>
            ) : (
              <Typography color="text.secondary">
                No cars added yet. Add your first car to register for events!
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Car Dialog */}
      <Dialog
        open={carDialogOpen}
        onClose={handleCloseCarDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{editingCar ? 'Edit Car' : 'Add New Car'}</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={carForm.handleSubmit(onCarSubmit)}>
            <TextField
              fullWidth
              label="Make"
              {...carForm.register('make', { required: 'Make is required' })}
              error={!!carForm.formState.errors.make}
              helperText={carForm.formState.errors.make?.message}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Model"
              {...carForm.register('model', { required: 'Model is required' })}
              error={!!carForm.formState.errors.model}
              helperText={carForm.formState.errors.model?.message}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Year"
              type="number"
              {...carForm.register('year', {
                required: 'Year is required',
                valueAsNumber: true,
                min: { value: 1900, message: 'Year must be after 1900' },
                max: {
                  value: new Date().getFullYear() + 1,
                  message: 'Year cannot be in the future',
                },
              })}
              error={!!carForm.formState.errors.year}
              helperText={carForm.formState.errors.year?.message}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Power (HP)"
              type="number"
              {...carForm.register('power', { valueAsNumber: true })}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={3}
              {...carForm.register('description')}
              margin="normal"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCarDialog}>Cancel</Button>
          <Button
            onClick={carForm.handleSubmit(onCarSubmit)}
            variant="contained"
            disabled={carForm.formState.isSubmitting}
          >
            {editingCar ? 'Update' : 'Add'} Car
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}
