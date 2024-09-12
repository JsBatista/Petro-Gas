import {
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { type SubmitHandler, useForm } from "react-hook-form"

import { type ApiError, type SensorDataCreate, SensorDataService } from "../../client"
import useCustomToast from "../../hooks/useCustomToast"
import { handleError } from "../../utils"

interface AddSensorDataProps {
  isOpen: boolean
  onClose: () => void
}

const AddSensorData = ({ isOpen, onClose }: AddSensorDataProps) => {
  const queryClient = useQueryClient()
  const showToast = useCustomToast()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SensorDataCreate>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      equipment_id: "",
      value: 0,
      timestamp: new Date(),
    },
  })

  const mutation = useMutation({
    mutationFn: (data: SensorDataCreate) =>
      SensorDataService.createSensorData({ requestBody: data }),
    onSuccess: () => {
      showToast("Success!", "Sensor Data created successfully.", "success")
      reset()
      onClose()
    },
    onError: (err: ApiError) => {
      handleError(err, showToast)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["sensors"] })
    },
  })

  const onSubmit: SubmitHandler<SensorDataCreate> = (data) => {
    mutation.mutate(data)
  }

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size={{ base: "sm", md: "md" }}
        isCentered
      >
        <ModalOverlay />
        <ModalContent as="form" onSubmit={handleSubmit(onSubmit)}>
          <ModalHeader>Add Sensor Data</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl isRequired isInvalid={!!errors.equipment_id}>
              <FormLabel htmlFor="equipment_id">Equipment Id</FormLabel>
              <Input
                id="equipment_id"
                {...register("equipment_id", {
                  required: "Equipment Id is required.",
                })}
                placeholder="Equipment Id"
                type="text"
              />
              {errors.equipment_id && (
                <FormErrorMessage>{errors.equipment_id.message}</FormErrorMessage>
              )}
            </FormControl>
            <FormControl mt={4} isRequired isInvalid={!!errors.value}>
              <FormLabel htmlFor="value">Value</FormLabel>
              <Input
                id="value"
                {...register("value")}
                placeholder="Value"
                type="number"
              />
            </FormControl>
          </ModalBody>

          <ModalFooter gap={3}>
            <Button variant="primary" type="submit" isLoading={isSubmitting}>
              Save
            </Button>
            <Button onClick={onClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default AddSensorData
