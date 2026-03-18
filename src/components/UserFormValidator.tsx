import { User } from "../models/User";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

interface MyFormProps {
    mode: number; // 1 = crear, 2 = actualizar
    handleCreate?: (values: User) => void;
    handleUpdate?: (values: User) => void;
    user?: User | null;
}

const UserFormValidator: React.FC<MyFormProps> = ({
    mode,
    handleCreate,
    handleUpdate,
    user,
}) => {
    const handleSubmit = (formattedValues: User) => {
        if (mode === 1 && handleCreate) {
            handleCreate(formattedValues);
        } else if (mode === 2 && handleUpdate) {
            handleUpdate(formattedValues);
        } else {
            console.error("No se proporcionó la función para el modo actual");
        }
    };

    return (
        <Formik
            initialValues={
                user || {
                    name: "",
                    email: "",
                    password: "",
                    age: "",
                    city: "",
                    phone: "",
                    is_active: true,
                }
            }
            validationSchema={Yup.object({
                name: Yup.string().required("El nombre es obligatorio"),
                email: Yup.string()
                    .email("Email inválido")
                    .required("El email es obligatorio"),
                password:
                    mode === 1
                        ? Yup.string().required("La contraseña es obligatoria")
                        : Yup.string().notRequired(),
                age: Yup.number()
                    .typeError("Debe ser un número")
                    .positive("Debe ser positivo")
                    .integer("Debe ser un número entero")
                    .required("La edad es obligatoria"),
                city: Yup.string().required("La ciudad es obligatoria"),
                phone: Yup.string()
                    .matches(/^\d{10}$/, "El teléfono debe tener 10 dígitos")
                    .required("El teléfono es obligatorio"),
            })}
            onSubmit={(values) => {
                const formattedValues = { ...values, age: Number(values.age) };
                handleSubmit(formattedValues);
            }}
        >
            {({ handleSubmit }) => (
                <Form
                    onSubmit={handleSubmit}
                    className="grid grid-cols-1 gap-4 p-6 bg-white rounded-md shadow-md"
                >
                    {/* Nombre */}
                    <div>
                        <label htmlFor="name">Nombre</label>
                        <Field type="text" name="name" className="form-control" />
                        <ErrorMessage name="name" component="p" className="text-red-500" />
                    </div>

                    {/* Email */}
                    <div>
                        <label htmlFor="email">Correo</label>
                        <Field type="email" name="email" className="form-control" />
                        <ErrorMessage name="email" component="p" className="text-red-500" />
                    </div>

                    {/* Password (solo en crear) */}
                    {mode === 1 && (
                        <div>
                            <label htmlFor="password">Contraseña</label>
                            <Field type="password" name="password" className="form-control" />
                            <ErrorMessage
                                name="password"
                                component="p"
                                className="text-red-500"
                            />
                        </div>
                    )}

                    {/* Edad */}
                    <div>
                        <label htmlFor="age">Edad</label>
                        <Field type="number" name="age" className="form-control" />
                        <ErrorMessage name="age" component="p" className="text-red-500" />
                    </div>

                    {/* Ciudad */}
                    <div>
                        <label htmlFor="city">Ciudad</label>
                        <Field type="text" name="city" className="form-control" />
                        <ErrorMessage name="city" component="p" className="text-red-500" />
                    </div>

                    {/* Teléfono */}
                    <div>
                        <label htmlFor="phone">Teléfono</label>
                        <Field type="text" name="phone" className="form-control" />
                        <ErrorMessage name="phone" component="p" className="text-red-500" />
                    </div>

                    {/* Activo */}
                    <div className="flex items-center">
                        <Field type="checkbox" name="is_active" className="mr-2" />
                        <label htmlFor="is_active">Activo</label>
                    </div>

                    {/* Botón */}
                    <button type="submit" className="btn btn-primary">
                        {mode === 1 ? "Crear Usuario" : "Actualizar Usuario"}
                    </button>
                </Form>
            )}
        </Formik>
    );
};

export default UserFormValidator;
