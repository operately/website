export const SideBySideList = (props) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div>
      <h2 className="font-bold">{props.left.title}</h2>
      <ul>
        {props.left.items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </div>

    <div>
      <h2 className="font-bold">{props.right.title}</h2>
      <ul>
        {props.right.items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </div>
  </div>
);
