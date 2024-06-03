export const SideBySideList = (props) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div>
      <div className="font-bold">{props.left.title}</div>
      <ul>
        {props.left.items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </div>

    <div>
      <div className="font-bold">{props.right.title}</div>
      <ul>
        {props.right.items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </div>
  </div>
);
