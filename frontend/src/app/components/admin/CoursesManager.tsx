import { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import { Plus, Edit, Trash2, Calendar, MapPin, User } from 'lucide-react';
import type { Product } from '../../context/CartContext';
import { toast } from 'sonner';
import { formatCurrency } from '../../utils/formatters';

const formatPriceInput = (value: string) => {
  const digits = value.replace(/\D/g, '');

  if (!digits) return '';

  return (Number(digits) / 100).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const parsePriceInput = (value: string) => {
  return Number(value.replace(/\./g, '').replace(',', '.')) || 0;
};

const formatDateForDisplay = (date: string) => {
  if (!date) return '';

  const [year, month, day] = date.split('-');
  return `${day}/${month}/${year}`;
};

const formatCoursePeriod = (startDate: string, endDate: string) => {
  if (startDate === endDate) return formatDateForDisplay(startDate);

  return `${formatDateForDisplay(startDate)} - ${formatDateForDisplay(endDate)}`;
};

const parseCoursePeriod = (date: string) => {
  const [start = '', end = ''] = date.split(' - ');

  const toHtmlDate = (value: string) => {
    const [day, month, year] = value.split('/');
    return day && month && year ? `${year}-${month}-${day}` : '';
  };

  const startDate = toHtmlDate(start);
  return {
    startDate,
    endDate: toHtmlDate(end) || startDate,
  };
};

export function CoursesManager() {
  const { products, addProduct, updateProduct, deleteProduct } = useAdmin();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    startDate: '',
    endDate: '',
    location: '',
    instructor: '',
    stock: '',
    image: ''
  });

  const courses = products.filter(p => p.type === 'course');

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      description: '',
      startDate: '',
      endDate: '',
      location: '',
      instructor: '',
      stock: '',
      image: ''
    });
  };

  const handleAdd = async () => {
    if (!formData.name || !formData.price || !formData.description || !formData.startDate || !formData.endDate) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    if (formData.endDate < formData.startDate) {
      toast.error('A data final nao pode ser anterior a data inicial');
      return;
    }

    try {
      await addProduct({
        name: formData.name,
        price: parsePriceInput(formData.price),
        description: formData.description,
        date: formatCoursePeriod(formData.startDate, formData.endDate),
        location: formData.location,
        instructor: formData.instructor,
        stock: parseInt(formData.stock) || 0,
        image: formData.image || 'https://images.unsplash.com/photo-1622115585848-1d5b6e8af4e4',
        type: 'course'
      });

      toast.success('Curso adicionado com sucesso!');
      setIsAddDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Não foi possível adicionar o curso');
    }
  };

  const handleEdit = (course: Product) => {
    const { startDate, endDate } = parseCoursePeriod(course.date || '');

    setSelectedCourse(course);
    setFormData({
      name: course.name,
      price: formatPriceInput(Math.round(course.price * 100).toString()),
      description: course.description,
      startDate,
      endDate,
      location: course.location || '',
      instructor: course.instructor || '',
      stock: course.stock?.toString() || '',
      image: course.image
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (!selectedCourse) return;

    if (!formData.name || !formData.price || !formData.description || !formData.startDate || !formData.endDate) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    if (formData.endDate < formData.startDate) {
      toast.error('A data final nao pode ser anterior a data inicial');
      return;
    }

    try {
      await updateProduct(selectedCourse.id, {
        name: formData.name,
        price: parsePriceInput(formData.price),
        description: formData.description,
        date: formatCoursePeriod(formData.startDate, formData.endDate),
        location: formData.location,
        instructor: formData.instructor,
        stock: parseInt(formData.stock) || 0,
        image: formData.image
      });

      toast.success('Curso atualizado com sucesso!');
      setIsEditDialogOpen(false);
      setSelectedCourse(null);
      resetForm();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Não foi possível atualizar o curso');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedCourse) return;
    try {
      await deleteProduct(selectedCourse.id);
      toast.success('Curso excluído com sucesso!');
      setIsDeleteDialogOpen(false);
      setSelectedCourse(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Não foi possível excluir o curso');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent">
            Gerenciar Cursos
          </h2>
          <p className="text-gray-600 mt-1">{courses.length} cursos cadastrados</p>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
              <Plus className="size-4 mr-2" />
              Adicionar Curso
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Adicionar Novo Curso</DialogTitle>
              <DialogDescription>
                Preencha as informações do curso presencial
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nome do Curso *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Curso de Primeiros Socorros"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="price">Valor (R$) *</Label>
                  <Input
                    id="price"
                    type="text"
                    inputMode="numeric"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: formatPriceInput(e.target.value) })}
                    placeholder="0,00"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="stock">Vagas Disponíveis</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="startDate">Data inicial *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="endDate">Data final *</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="location">Local</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Ex: São Paulo - SP"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="instructor">Instrutor</Label>
                <Input
                  id="instructor"
                  value={formData.instructor}
                  onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                  placeholder="Ex: Dr. João Silva"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Descrição *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descreva o conteúdo e os objetivos do curso"
                  rows={3}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="image">URL da Imagem</Label>
                <Input
                  id="image"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://..."
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleAdd}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                Adicionar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Curso</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Local</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Vagas</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {courses.map((course) => (
              <TableRow key={course.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{course.name}</div>
                    {course.instructor && (
                      <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                        <User className="size-3" />
                        {course.instructor}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm">
                    <Calendar className="size-3 text-purple-600" />
                    {course.date}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm">
                    <MapPin className="size-3 text-pink-600" />
                    {course.location}
                  </div>
                </TableCell>
                <TableCell className="text-purple-600 font-semibold">
                  {formatCurrency(course.price)}
                </TableCell>
                <TableCell>
                  <span className={course.stock && course.stock < 5 ? 'text-red-600' : 'text-green-600'}>
                    {course.stock} vagas
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(course)}
                    >
                      <Edit className="size-4 text-purple-600" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setSelectedCourse(course);
                        setIsDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="size-4 text-red-600" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Curso</DialogTitle>
            <DialogDescription>
              Atualize as informações do curso
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Nome do Curso *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-price">Valor (R$) *</Label>
                <Input
                  id="edit-price"
                  type="text"
                  inputMode="numeric"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: formatPriceInput(e.target.value) })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-stock">Vagas Disponíveis</Label>
                <Input
                  id="edit-stock"
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-startDate">Data inicial *</Label>
                <Input
                  id="edit-startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-endDate">Data final *</Label>
                <Input
                  id="edit-endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-location">Local</Label>
              <Input
                id="edit-location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-instructor">Instrutor</Label>
              <Input
                id="edit-instructor"
                value={formData.instructor}
                onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-description">Descrição *</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-image">URL da Imagem</Label>
              <Input
                id="edit-image"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleUpdate}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              Atualizar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o curso <strong>{selectedCourse?.name}</strong>?
              Esta ação não pode ser desfeita e afetará os alunos inscritos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
