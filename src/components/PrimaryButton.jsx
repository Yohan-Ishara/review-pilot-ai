import Button from './Button'

export default function PrimaryButton(props) {
  return (
    <Button
      {...props}
      className={`rounded-xl px-5 shadow-md shadow-indigo-100 ${props.className || ''}`}
    />
  )
}
