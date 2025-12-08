import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  Divider,
  Chip
} from '@mui/material';
import {
  Mail,
  MessageCircle,
  HelpCircle,
  BookOpen,
  Phone,
  ExternalLink,
  ChevronDown
} from 'lucide-react';

export default function SupportPage() {
  const [expandedSection, setExpandedSection] = useState<string | false>(false);

  const handleChange = (section: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedSection(isExpanded ? section : false);
  };

  const contactEmail = 'soporte@onestore.com';
  const contactWhatsApp = '+1234567890';
  const whatsAppLink = `https://wa.me/${contactWhatsApp.replace(/[^0-9]/g, '')}`;

  const faqSections = [
    {
      title: 'General',
      questions: [
        {
          q: '¿Qué es OneStore?',
          a: 'OneStore es un sistema integral de gestión de inventario y ventas diseñado para ayudar a las empresas a administrar sus productos, ventas, compras y almacenes de manera eficiente.'
        },
        {
          q: '¿Cómo cambio mi contraseña?',
          a: 'Puedes cambiar tu contraseña desde la página de Perfil. Haz clic en tu nombre en el menú lateral y selecciona "Cambiar contraseña".'
        },
        {
          q: '¿Puedo usar el sistema en múltiples dispositivos?',
          a: 'Sí, OneStore es una aplicación web que puedes acceder desde cualquier dispositivo con conexión a internet y un navegador moderno.'
        }
      ]
    },
    {
      title: 'Productos',
      questions: [
        {
          q: '¿Cómo agrego un nuevo producto?',
          a: 'Ve a la sección "Productos" y haz clic en el botón "Agregar Producto". Completa el formulario con la información del producto (nombre, SKU, precios, categoría, unidad de medida, etc.) y guarda.'
        },
        {
          q: '¿Cómo edito un producto existente?',
          a: 'En la tabla de productos, haz clic en el ícono de lápiz (editar) en la fila del producto que deseas modificar. Realiza los cambios necesarios y guarda.'
        },
        {
          q: '¿Cómo veo el stock actual de un producto?',
          a: 'El stock actual se muestra en la columna "Stock Actual" de la tabla de productos. Este valor se calcula automáticamente basado en los movimientos de inventario.'
        },
        {
          q: '¿Cómo exporto o importo productos?',
          a: 'En la parte superior de la página de Productos, encontrarás los botones de Exportar e Importar. Puedes exportar en formato CSV o JSON, e importar archivos con la misma estructura.'
        },
        {
          q: '¿Qué son las fórmulas de productos?',
          a: 'Las fórmulas de productos te permiten definir recetas o combinaciones de productos. Útiles para productos compuestos o kits que se arman con múltiples componentes.'
        }
      ]
    },
    {
      title: 'Categorías y Unidades de Medida',
      questions: [
        {
          q: '¿Cómo creo una categoría?',
          a: 'Ve a "Categorías" y haz clic en "Agregar Categoría". Proporciona un nombre y descripción opcional. Las categorías ayudan a organizar tus productos.'
        },
        {
          q: '¿Puedo tener categorías anidadas?',
          a: 'Sí, puedes crear categorías padre e hijas usando el campo "Categoría padre" al crear o editar una categoría.'
        },
        {
          q: '¿Qué son las unidades de medida?',
          a: 'Las unidades de medida definen cómo se cuantifican los productos (kg, litros, unidades, etc.). Algunas unidades son estándar del sistema y no se pueden modificar.'
        }
      ]
    },
    {
      title: 'Ventas',
      questions: [
        {
          q: '¿Cómo registro una venta?',
          a: 'Ve a "Ventas" y haz clic en "Agregar Venta". Completa la información del cliente, selecciona los productos y cantidades, y confirma la venta.'
        },
        {
          q: '¿Puedo cancelar una venta?',
          a: 'Sí, puedes cancelar una venta desde la vista de detalles. Al cancelar, el stock se restaura automáticamente.'
        },
        {
          q: '¿Cómo veo el historial de ventas?',
          a: 'Todas las ventas se muestran en la tabla de la página "Ventas". Puedes ver los detalles haciendo clic en el ícono de ojo.'
        },
        {
          q: '¿Cómo exporto las ventas?',
          a: 'Usa el botón "Exportar Ventas" en la parte superior de la página de Ventas. Puedes elegir entre formato CSV o JSON.'
        }
      ]
    },
    {
      title: 'Compras y Proveedores',
      questions: [
        {
          q: '¿Cómo creo una orden de compra?',
          a: 'Ve a "Compras" y haz clic en "Nueva Orden de Compra". Completa la información del proveedor, agrega los productos y cantidades, y guarda la orden.'
        },
        {
          q: '¿Cómo marco una orden como recibida?',
          a: 'En la tabla de órdenes de compra, las órdenes pendientes tienen un botón de check (✓). Haz clic en él para marcar la orden como recibida, lo que actualizará el inventario.'
        },
        {
          q: '¿Cómo agrego un nuevo proveedor?',
          a: 'Ve a "Proveedores" y haz clic en "Agregar Proveedor". Completa la información de contacto y dirección del proveedor.'
        }
      ]
    },
    {
      title: 'Inventario y Bodegas',
      questions: [
        {
          q: '¿Cómo creo una bodega?',
          a: 'Ve a "Bodegas" y haz clic en "Agregar Bodega". Proporciona el nombre, dirección y teléfono de la bodega.'
        },
        {
          q: '¿Cómo veo el stock en cada bodega?',
          a: 'El stock por bodega se muestra en la sección de "Productos de Bodega". Puedes filtrar por bodega para ver el inventario específico.'
        },
        {
          q: '¿Qué son los movimientos de stock?',
          a: 'Los movimientos de stock registran todas las entradas y salidas de productos. Se crean automáticamente cuando realizas ventas, compras o ajustes de inventario.'
        },
        {
          q: '¿Cómo hago un ajuste de inventario?',
          a: 'Los ajustes de inventario se pueden realizar desde la sección de "Movimientos de Stock" o directamente desde los productos de bodega.'
        }
      ]
    },
    {
      title: 'Clientes',
      questions: [
        {
          q: '¿Cómo agrego un cliente?',
          a: 'Ve a "Clientes" y haz clic en "Agregar Cliente". Completa la información del cliente (nombre, documento, contacto, etc.).'
        },
        {
          q: '¿Puedo importar clientes desde un archivo?',
          a: 'Sí, usa el botón "Importar Clientes" en la parte superior de la página. El archivo debe estar en formato CSV o JSON con la estructura correcta.'
        }
      ]
    },
    {
      title: 'Exportación e Importación',
      questions: [
        {
          q: '¿Qué formatos puedo usar para exportar?',
          a: 'Puedes exportar datos en formato CSV (para Excel) o JSON (para sistemas técnicos). Ambos formatos mantienen toda la información de los registros.'
        },
        {
          q: '¿Cómo importo datos?',
          a: 'En cualquier página con tabla de datos, usa el botón "Importar" en la parte superior. Selecciona el formato (CSV o JSON) y sube el archivo. El sistema validará y procesará los datos.'
        },
        {
          q: '¿Qué estructura debe tener el archivo de importación?',
          a: 'El archivo debe tener la misma estructura que los archivos exportados. La mejor forma de asegurarte es exportar primero un ejemplo y usar esa estructura como plantilla.'
        },
        {
          q: '¿Qué pasa si algunos registros fallan al importar?',
          a: 'El sistema te mostrará cuántos registros se importaron exitosamente y cuántos fallaron. Los errores específicos se mostrarán en el mensaje de resultado.'
        }
      ]
    },
    {
      title: 'Configuración',
      questions: [
        {
          q: '¿Cómo cambio el nombre de mi tienda?',
          a: 'Ve a "Configuración" y modifica el campo "Nombre de la Tienda". También puedes subir un logo desde esta sección.'
        },
        {
          q: '¿Dónde veo el historial de cambios?',
          a: 'Todas las acciones importantes se registran en "Auditoría". Puedes ver quién hizo qué cambios y cuándo.'
        }
      ]
    }
  ];

  const documentationSections = [
    {
      title: 'Gestión de Productos',
      content: [
        {
          subtitle: 'Crear un Producto',
          steps: [
            '1. Navega a la sección "Productos" desde el menú lateral',
            '2. Haz clic en el botón "Agregar Producto"',
            '3. Completa el formulario:',
            '   - Nombre del producto',
            '   - SKU (código único)',
            '   - Categoría (debe existir previamente)',
            '   - Unidad de medida',
            '   - Precio de compra y venta',
            '   - Stock mínimo y máximo',
            '   - Descripción (opcional)',
            '4. Haz clic en "Guardar"'
          ]
        },
        {
          subtitle: 'Editar un Producto',
          steps: [
            '1. En la tabla de productos, localiza el producto',
            '2. Haz clic en el ícono de lápiz (editar)',
            '3. Modifica los campos necesarios',
            '4. Guarda los cambios'
          ]
        },
        {
          subtitle: 'Ver Stock Actual',
          steps: [
            '1. El stock actual se muestra en la columna "Stock Actual"',
            '2. Este valor se calcula automáticamente',
            '3. Se actualiza con cada movimiento de inventario'
          ]
        },
        {
          subtitle: 'Exportar/Importar Productos',
          steps: [
            '1. En la parte superior de la página, selecciona el formato (CSV o JSON)',
            '2. Para exportar: Haz clic en "Exportar Productos"',
            '3. Para importar: Haz clic en "Importar Productos" y selecciona el archivo',
            '4. El sistema procesará y mostrará los resultados'
          ]
        }
      ]
    },
    {
      title: 'Gestión de Ventas',
      content: [
        {
          subtitle: 'Registrar una Venta',
          steps: [
            '1. Ve a "Ventas" en el menú lateral',
            '2. Haz clic en "Agregar Venta"',
            '3. Completa la información:',
            '   - Selecciona la bodega',
            '   - Ingresa datos del cliente (o selecciona uno existente)',
            '   - Agrega productos y cantidades',
            '   - Selecciona método de pago',
            '   - Ingresa notas (opcional)',
            '4. Confirma la venta',
            '5. El stock se actualizará automáticamente'
          ]
        },
        {
          subtitle: 'Cancelar una Venta',
          steps: [
            '1. Abre la venta desde la tabla',
            '2. Haz clic en "Cancelar Venta"',
            '3. Confirma la cancelación',
            '4. El stock se restaurará automáticamente'
          ]
        },
        {
          subtitle: 'Ver Historial de Ventas',
          steps: [
            '1. Todas las ventas aparecen en la tabla de "Ventas"',
            '2. Haz clic en el ícono de ojo para ver detalles',
            '3. Puedes filtrar y buscar ventas',
            '4. Exporta los datos si necesitas un reporte'
          ]
        }
      ]
    },
    {
      title: 'Gestión de Compras',
      content: [
        {
          subtitle: 'Crear una Orden de Compra',
          steps: [
            '1. Ve a "Compras" en el menú',
            '2. Haz clic en "Nueva Orden de Compra"',
            '3. Completa:',
            '   - Selecciona el proveedor',
            '   - Ingresa número de referencia',
            '   - Agrega productos y cantidades',
            '   - Ingresa notas (opcional)',
            '4. Guarda la orden',
            '5. La orden quedará en estado "Pendiente"'
          ]
        },
        {
          subtitle: 'Recibir una Orden',
          steps: [
            '1. Localiza la orden pendiente en la tabla',
            '2. Haz clic en el ícono de check (✓)',
            '3. Confirma la recepción',
            '4. El stock se actualizará automáticamente',
            '5. La orden cambiará a estado "Recibida"'
          ]
        }
      ]
    },
    {
      title: 'Gestión de Inventario',
      content: [
        {
          subtitle: 'Crear una Bodega',
          steps: [
            '1. Ve a "Bodegas"',
            '2. Haz clic en "Agregar Bodega"',
            '3. Completa nombre, dirección y teléfono',
            '4. Guarda la bodega'
          ]
        },
        {
          subtitle: 'Ver Stock por Bodega',
          steps: [
            '1. Ve a "Productos de Bodega"',
            '2. Filtra por bodega si es necesario',
            '3. Verás el stock disponible de cada producto',
            '4. Puedes hacer ajustes desde aquí'
          ]
        },
        {
          subtitle: 'Movimientos de Stock',
          steps: [
            '1. Los movimientos se crean automáticamente',
            '2. Se registran en "Movimientos de Stock"',
            '3. Puedes ver el historial completo',
            '4. Cada movimiento muestra tipo, cantidad y motivo'
          ]
        }
      ]
    },
    {
      title: 'Categorías y Organización',
      content: [
        {
          subtitle: 'Crear Categorías',
          steps: [
            '1. Ve a "Categorías"',
            '2. Haz clic en "Agregar Categoría"',
            '3. Ingresa nombre y descripción',
            '4. Opcionalmente selecciona categoría padre',
            '5. Guarda'
          ]
        },
        {
          subtitle: 'Unidades de Medida',
          steps: [
            '1. Ve a "Unidades de Medida"',
            '2. Algunas unidades son estándar (no editables)',
            '3. Puedes crear unidades personalizadas',
            '4. Las unidades se usan al crear productos'
          ]
        }
      ]
    },
    {
      title: 'Clientes y Proveedores',
      content: [
        {
          subtitle: 'Gestionar Clientes',
          steps: [
            '1. Ve a "Clientes"',
            '2. Agrega, edita o elimina clientes',
            '3. Los clientes se pueden usar al crear ventas',
            '4. Puedes importar clientes desde archivo'
          ]
        },
        {
          subtitle: 'Gestionar Proveedores',
          steps: [
            '1. Ve a "Proveedores"',
            '2. Agrega información de contacto',
            '3. Los proveedores se usan en órdenes de compra',
            '4. Mantén la información actualizada'
          ]
        }
      ]
    },
    {
      title: 'Exportación e Importación de Datos',
      content: [
        {
          subtitle: 'Exportar Datos',
          steps: [
            '1. Ve a cualquier sección con datos (Productos, Ventas, etc.)',
            '2. En la parte superior, selecciona formato (CSV o JSON)',
            '3. Haz clic en "Exportar [Entidad]"',
            '4. El archivo se descargará automáticamente',
            '5. Usa CSV para Excel, JSON para sistemas técnicos'
          ]
        },
        {
          subtitle: 'Importar Datos',
          steps: [
            '1. Prepara tu archivo con la estructura correcta',
            '2. La mejor forma: exporta primero un ejemplo',
            '3. Completa el archivo con tus datos',
            '4. Selecciona el formato (CSV o JSON)',
            '5. Haz clic en "Importar [Entidad]"',
            '6. Selecciona el archivo',
            '7. El sistema procesará y mostrará resultados',
            '8. Revisa los mensajes de éxito/error'
          ]
        },
        {
          subtitle: 'Estructura de Archivos',
          steps: [
            '1. CSV: Primera fila son los encabezados',
            '2. JSON: Array de objetos',
            '3. Los campos deben coincidir con la estructura exportada',
            '4. Campos opcionales pueden omitirse',
            '5. Fechas en formato ISO (YYYY-MM-DD)'
          ]
        }
      ]
    },
    {
      title: 'Configuración y Perfil',
      content: [
        {
          subtitle: 'Configurar Tienda',
          steps: [
            '1. Ve a "Configuración"',
            '2. Cambia el nombre de la tienda',
            '3. Sube un logo (opcional)',
            '4. Guarda los cambios'
          ]
        },
        {
          subtitle: 'Gestionar Perfil',
          steps: [
            '1. Ve a "Perfil"',
            '2. Actualiza tu información personal',
            '3. Cambia tu contraseña si es necesario',
            '4. Guarda los cambios'
          ]
        },
        {
          subtitle: 'Auditoría',
          steps: [
            '1. Ve a "Auditoría"',
            '2. Revisa el historial de acciones',
            '3. Filtra por usuario, acción o fecha',
            '4. Exporta el registro si es necesario'
          ]
        }
      ]
    }
  ];

  return (
    <div className="p-4">
      <Typography variant="h4" className="mb-6 font-bold">
        Centro de Soporte
      </Typography>

      {/* Contact Banners */}
      <Box className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:shadow-lg transition-shadow">
          <CardContent className="flex items-center gap-4">
            <Mail size={48} className="flex-shrink-0" />
            <Box>
              <Typography variant="h6" className="font-bold mb-1">
                Soporte por Email
              </Typography>
              <Typography variant="body2" className="mb-2">
                Escríbenos y te responderemos en menos de 24 horas
              </Typography>
              <Button
                variant="contained"
                color="inherit"
                startIcon={<Mail size={20} />}
                href={`mailto:${contactEmail}`}
                className="bg-white text-blue-600 hover:bg-gray-100"
              >
                {contactEmail}
              </Button>
            </Box>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white hover:shadow-lg transition-shadow">
          <CardContent className="flex items-center gap-4">
            <MessageCircle size={48} className="flex-shrink-0" />
            <Box>
              <Typography variant="h6" className="font-bold mb-1">
                Soporte por WhatsApp
              </Typography>
              <Typography variant="body2" className="mb-2">
                Chatea con nosotros en tiempo real
              </Typography>
              <Button
                variant="contained"
                color="inherit"
                startIcon={<MessageCircle size={20} />}
                href={whatsAppLink}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white text-green-600 hover:bg-gray-100"
              >
                Abrir WhatsApp
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* FAQ Section */}
      <Card className="mb-6">
        <CardContent>
          <Box className="flex items-center gap-2 mb-4">
            <HelpCircle size={32} className="text-primary" />
            <Typography variant="h5" className="font-bold">
              Preguntas Frecuentes
            </Typography>
          </Box>
          <Divider className="mb-4" />

          {faqSections.map((section, sectionIndex) => (
            <Box key={sectionIndex} className="mb-4">
              <Typography variant="h6" className="font-semibold mb-2 text-primary">
                {section.title}
              </Typography>
              {section.questions.map((faq, faqIndex) => (
                <Accordion
                  key={faqIndex}
                  expanded={expandedSection === `faq-${sectionIndex}-${faqIndex}`}
                  onChange={handleChange(`faq-${sectionIndex}-${faqIndex}`)}
                  className="mb-2"
                >
                  <AccordionSummary expandIcon={<ChevronDown />}>
                    <Typography variant="subtitle1" className="font-medium">
                      {faq.q}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2" className="text-gray-700">
                      {faq.a}
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>
          ))}
        </CardContent>
      </Card>

      {/* Documentation Section */}
      <Card>
        <CardContent>
          <Box className="flex items-center gap-2 mb-4">
            <BookOpen size={32} className="text-primary" />
            <Typography variant="h5" className="font-bold">
              Documentación Completa
            </Typography>
          </Box>
          <Divider className="mb-4" />

          {documentationSections.map((section, sectionIndex) => (
            <Box key={sectionIndex} className="mb-6">
              <Typography variant="h6" className="font-semibold mb-3 text-primary">
                {section.title}
              </Typography>

              {section.content.map((item, itemIndex) => (
                <Box key={itemIndex} className="mb-4 ml-4">
                  <Typography variant="subtitle1" className="font-semibold mb-2">
                    {item.subtitle}
                  </Typography>
                  <Box component="ul" className="list-disc list-inside space-y-1 ml-4">
                    {item.steps.map((step, stepIndex) => (
                      <Typography
                        key={stepIndex}
                        component="li"
                        variant="body2"
                        className="text-gray-700"
                      >
                        {step}
                      </Typography>
                    ))}
                  </Box>
                </Box>
              ))}

              {sectionIndex < documentationSections.length - 1 && (
                <Divider className="my-4" />
              )}
            </Box>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

