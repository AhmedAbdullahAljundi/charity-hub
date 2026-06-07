import { MonthDetailPage } from '@/components/disbursement/MonthDetailPage'

interface Props {
  params: Promise<{ id: string }>
}

export default function MonthDetailRoute({ params }: Props) {
  return <MonthDetailPage params={params} />
}

export const metadata = {
  title: 'تفاصيل شهر القبض — CharityHub',
}
