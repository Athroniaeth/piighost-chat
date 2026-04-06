interface MetaProps {
  title: string;
  description?: string;
}

const Meta = ({ title, description }: MetaProps) => {
  return (
    <>
      <title>{title}</title>
      {description && <meta name="description" content={description} />}
    </>
  );
};

export default Meta;
