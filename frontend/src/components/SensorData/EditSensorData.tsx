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

import {
  type ApiError,
  type SensorDataPublic,
  type SensorDataUpdate,
  SensorDataService,
} from "../../client"
import useCustomToast from "../../hooks/useCustomToast"
import { handleError } from "../../utils"

interface EditSensorDataProps {
  sensorData: SensorDataPublic
  isOpen: boolean
  onClose: () => void
}

const EditSensorData = ({ sensorData, isOpen, onClose }: EditSensorDataProps) => {
  const queryClient = useQueryClient()
  const showToast = useCustomToast()
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors, isDirty },
  } = useForm<SensorDataUpdate>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: sensorData,
  })

  const mutation = useMutation({
    mutationFn: (data: SensorDataUpdate) =>
      SensorDataService.updateSensorData({ id: sensorData.id, requestBody: data }),
    onSuccess: () => {
      showToast("Success!", "Sensor Data updated successfully.", "success")
      onClose()
    },
    onError: (err: ApiError) => {
      handleError(err, showToast)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["sensors"] })
    },
  })

  const onSubmit: SubmitHandler<SensorDataUpdate> = async (data) => {
    mutation.mutate(data)
  }

  const onCancel = () => {
    reset()
    onClose()
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
          <ModalHeader>Edit Sensor Data</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl isInvalid={!!errors.equipment_id}>
              <FormLabel htmlFor="equipment_id">Equipment Id</FormLabel>
              <Input
                id="equipment_id"
                {...register("equipment_id", {
                  required: "Equipment Id is required",
                })}
                type="text"
              />
              {errors.equipment_id && (
                <FormErrorMessage>{errors.equipment_id.message}</FormErrorMessage>
              )}
            </FormControl>
            <FormControl mt={4}>
              <FormLabel htmlFor="value">Value</FormLabel>
              <Input
                id="value"
                {...register("value")}
                placeholder="value"
                type="number"
              />
            </FormControl>
          </ModalBody>
          <ModalFooter gap={3}>
            <Button
              variant="primary"
              type="submit"
              isLoading={isSubmitting}
              isDisabled={!isDirty}
            >
              Save
            </Button>
            <Button onClick={onCancel}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default EditSensorData
