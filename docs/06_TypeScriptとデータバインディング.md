# 06. TypeScript とデータバインディング

WPF では XAML のデータバインディングと INotifyPropertyChanged で UI とデータを自動同期していました。Tauri では、TypeScript を使って同様の仕組みを実装します。

## WPF のデータバインディングとの比較

### WPF（参考）

```csharp
// ViewModel
public class PersonViewModel : INotifyPropertyChanged
{
    private string _name = "";
    public string Name
    {
        get => _name;
        set { _name = value; OnPropertyChanged(); }
    }

    private int _age = 0;
    public int Age
    {
        get => _age;
        set { _age = value; OnPropertyChanged(); }
    }

    public event PropertyChangedEventHandler PropertyChanged;
    protected void OnPropertyChanged([CallerMemberName] string name = null)
    {
        PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(name));
    }
}
```

```xml
<!-- XAML -->
<StackPanel DataContext="{Binding PersonViewModel}">
    <TextBox Text="{Binding Name, Mode=TwoWay}" />
    <TextBox Text="{Binding Age, Mode=TwoWay}" />
    <TextBlock Text="{Binding Name}" />
</StackPanel>
```

### Tauri（TypeScript）

TypeScript では複数のアプローチがあります。段階的に紹介します。

## アプローチ 1: 基本的な DOM 操作

最もシンプルな方法です。初心者にはこちらから始めることをお勧めします。

```typescript
// データクラス
class Person {
    constructor(public name: string = "", public age: number = 0) {}
}

// UI管理クラス
class PersonView {
    private person: Person;
    private nameInput: HTMLInputElement;
    private ageInput: HTMLInputElement;
    private nameDisplay: HTMLElement;
    private ageDisplay: HTMLElement;

    constructor() {
        this.person = new Person();
        this.initializeElements();
        this.bindEvents();
        this.updateDisplay();
    }

    private initializeElements() {
        this.nameInput = document.getElementById(
            "name-input"
        ) as HTMLInputElement;
        this.ageInput = document.getElementById(
            "age-input"
        ) as HTMLInputElement;
        this.nameDisplay = document.getElementById(
            "name-display"
        ) as HTMLElement;
        this.ageDisplay = document.getElementById("age-display") as HTMLElement;
    }

    private bindEvents() {
        // 入力フィールドの変更を監視
        this.nameInput.addEventListener("input", (e) => {
            this.person.name = (e.target as HTMLInputElement).value;
            this.updateDisplay();
        });

        this.ageInput.addEventListener("input", (e) => {
            this.person.age =
                parseInt((e.target as HTMLInputElement).value) || 0;
            this.updateDisplay();
        });
    }

    private updateDisplay() {
        // 表示を更新
        this.nameDisplay.textContent = this.person.name;
        this.ageDisplay.textContent = this.person.age.toString();

        // 入力フィールドも更新（外部からの変更に対応）
        this.nameInput.value = this.person.name;
        this.ageInput.value = this.person.age.toString();
    }

    // 外部からデータを設定するメソッド
    public setPerson(person: Person) {
        this.person = person;
        this.updateDisplay();
    }

    public getPerson(): Person {
        return this.person;
    }
}

// 使用例
document.addEventListener("DOMContentLoaded", () => {
    const personView = new PersonView();

    // 初期データの設定
    personView.setPerson(new Person("田中太郎", 30));
});
```

対応する HTML:

```html
<div class="person-form">
    <div class="form-group">
        <label for="name-input">名前:</label>
        <input type="text" id="name-input" />
    </div>

    <div class="form-group">
        <label for="age-input">年齢:</label>
        <input type="number" id="age-input" />
    </div>

    <div class="display-area">
        <p>名前: <span id="name-display"></span></p>
        <p>年齢: <span id="age-display"></span></p>
    </div>
</div>
```

## アプローチ 2: オブザーバーパターン（より高度）

WPF の INotifyPropertyChanged に近い仕組みを実装します。

```typescript
// イベント型定義
type PropertyChangedCallback = (propertyName: string, newValue: any) => void;

// オブザーバブルなベースクラス
class Observable {
    private listeners: PropertyChangedCallback[] = [];

    protected notifyPropertyChanged(propertyName: string, newValue: any) {
        this.listeners.forEach((callback) => callback(propertyName, newValue));
    }

    public addPropertyChangedListener(callback: PropertyChangedCallback) {
        this.listeners.push(callback);
    }

    public removePropertyChangedListener(callback: PropertyChangedCallback) {
        const index = this.listeners.indexOf(callback);
        if (index > -1) {
            this.listeners.splice(index, 1);
        }
    }
}

// オブザーバブルなPersonクラス
class ObservablePerson extends Observable {
    private _name: string = "";
    private _age: number = 0;

    get name(): string {
        return this._name;
    }

    set name(value: string) {
        if (this._name !== value) {
            this._name = value;
            this.notifyPropertyChanged("name", value);
        }
    }

    get age(): number {
        return this._age;
    }

    set age(value: number) {
        if (this._age !== value) {
            this._age = value;
            this.notifyPropertyChanged("age", value);
        }
    }
}

// 自動バインディング機能付きビュー
class AutoBindingPersonView {
    private person: ObservablePerson;
    private bindings: Map<string, HTMLElement[]> = new Map();

    constructor() {
        this.person = new ObservablePerson();
        this.setupBindings();
        this.person.addPropertyChangedListener((prop, value) => {
            this.updateProperty(prop, value);
        });
    }

    private setupBindings() {
        // data-bind属性を持つ要素を自動的にバインド
        const elements = document.querySelectorAll("[data-bind]");
        elements.forEach((element) => {
            const bindingInfo = (element as HTMLElement).dataset.bind;
            if (bindingInfo) {
                const [property, mode] = bindingInfo.split(":");

                if (!this.bindings.has(property)) {
                    this.bindings.set(property, []);
                }
                this.bindings.get(property)!.push(element as HTMLElement);

                // 入力要素の場合はイベントリスナーを追加
                if (element instanceof HTMLInputElement) {
                    element.addEventListener("input", (e) => {
                        const target = e.target as HTMLInputElement;
                        if (property === "age") {
                            (this.person as any)[property] =
                                parseInt(target.value) || 0;
                        } else {
                            (this.person as any)[property] = target.value;
                        }
                    });
                }
            }
        });
    }

    private updateProperty(propertyName: string, value: any) {
        const elements = this.bindings.get(propertyName);
        if (elements) {
            elements.forEach((element) => {
                if (element instanceof HTMLInputElement) {
                    element.value = value.toString();
                } else {
                    element.textContent = value.toString();
                }
            });
        }
    }

    public setPerson(name: string, age: number) {
        this.person.name = name;
        this.person.age = age;
    }

    public getPerson(): { name: string; age: number } {
        return {
            name: this.person.name,
            age: this.person.age,
        };
    }
}

// 使用例
document.addEventListener("DOMContentLoaded", () => {
    const view = new AutoBindingPersonView();
    view.setPerson("佐藤花子", 25);
});
```

対応する HTML（data-bind 属性を使用）:

```html
<div class="person-form">
    <div class="form-group">
        <label>名前:</label>
        <input type="text" data-bind="name" />
    </div>

    <div class="form-group">
        <label>年齢:</label>
        <input type="number" data-bind="age" />
    </div>

    <div class="display-area">
        <p>名前: <span data-bind="name"></span></p>
        <p>年齢: <span data-bind="age"></span></p>
    </div>
</div>
```

## 実践例: 商品リストの管理

WPF でよく作るようなデータグリッドに相当する機能を実装してみます。

```typescript
// 商品データ
interface Product {
    id: number;
    name: string;
    price: number;
    quantity: number;
}

class ProductManager {
    private products: Product[] = [];
    private nextId = 1;
    private tableBody: HTMLTableSectionElement;
    private totalElement: HTMLElement;

    constructor() {
        this.tableBody = document.getElementById(
            "product-table-body"
        ) as HTMLTableSectionElement;
        this.totalElement = document.getElementById(
            "total-amount"
        ) as HTMLElement;
        this.bindEvents();
        this.updateDisplay();
    }

    private bindEvents() {
        // 追加ボタン
        document
            .getElementById("add-product")
            ?.addEventListener("click", () => {
                this.addProduct();
            });

        // フォームの送信
        document
            .getElementById("product-form")
            ?.addEventListener("submit", (e) => {
                e.preventDefault();
                this.addProduct();
            });
    }

    private addProduct() {
        const nameInput = document.getElementById(
            "product-name"
        ) as HTMLInputElement;
        const priceInput = document.getElementById(
            "product-price"
        ) as HTMLInputElement;
        const quantityInput = document.getElementById(
            "product-quantity"
        ) as HTMLInputElement;

        const product: Product = {
            id: this.nextId++,
            name: nameInput.value,
            price: parseFloat(priceInput.value) || 0,
            quantity: parseInt(quantityInput.value) || 0,
        };

        this.products.push(product);
        this.updateDisplay();
        this.clearForm();
    }

    private removeProduct(id: number) {
        this.products = this.products.filter((p) => p.id !== id);
        this.updateDisplay();
    }

    private updateDisplay() {
        // テーブルをクリア
        this.tableBody.innerHTML = "";

        // 商品を表示
        this.products.forEach((product) => {
            const row = this.createProductRow(product);
            this.tableBody.appendChild(row);
        });

        // 合計金額を更新
        const total = this.products.reduce(
            (sum, p) => sum + p.price * p.quantity,
            0
        );
        this.totalElement.textContent = total.toLocaleString();
    }

    private createProductRow(product: Product): HTMLTableRowElement {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${product.name}</td>
            <td class="number">${product.price.toLocaleString()}</td>
            <td class="number">${product.quantity}</td>
            <td class="number">${(
                product.price * product.quantity
            ).toLocaleString()}</td>
            <td>
                <button class="btn btn-danger btn-sm" onclick="productManager.removeProduct(${
                    product.id
                })">
                    削除
                </button>
            </td>
        `;
        return row;
    }

    private clearForm() {
        (document.getElementById("product-name") as HTMLInputElement).value =
            "";
        (document.getElementById("product-price") as HTMLInputElement).value =
            "";
        (
            document.getElementById("product-quantity") as HTMLInputElement
        ).value = "";
    }

    // グローバルからアクセスできるようにする
    public removeProduct(id: number) {
        this.removeProduct(id);
    }
}

// グローバル変数として設定
let productManager: ProductManager;

document.addEventListener("DOMContentLoaded", () => {
    productManager = new ProductManager();
});
```

対応する HTML:

```html
<div class="product-manager">
    <h2>商品管理</h2>

    <!-- 商品追加フォーム -->
    <form id="product-form" class="product-form">
        <div class="form-row">
            <input
                type="text"
                id="product-name"
                placeholder="商品名"
                required
            />
            <input
                type="number"
                id="product-price"
                placeholder="価格"
                min="0"
                step="0.01"
                required
            />
            <input
                type="number"
                id="product-quantity"
                placeholder="数量"
                min="1"
                required
            />
            <button type="submit" id="add-product" class="btn btn-primary">
                追加
            </button>
        </div>
    </form>

    <!-- 商品テーブル -->
    <table class="product-table">
        <thead>
            <tr>
                <th>商品名</th>
                <th>価格</th>
                <th>数量</th>
                <th>小計</th>
                <th>操作</th>
            </tr>
        </thead>
        <tbody id="product-table-body">
            <!-- 動的に生成される行 -->
        </tbody>
        <tfoot>
            <tr class="total-row">
                <td colspan="3">合計</td>
                <td class="number">¥<span id="total-amount">0</span></td>
                <td></td>
            </tr>
        </tfoot>
    </table>
</div>
```

## TypeScript の型安全性活用

WPF の強い型付けの利点を TypeScript でも活用しましょう。

```typescript
// 型定義
interface Customer {
    readonly id: number;
    name: string;
    email: string;
    age: number;
}

type CustomerFormData = Omit<Customer, "id">;

// バリデーション機能付きフォーム
class CustomerForm {
    private form: HTMLFormElement;
    private errors: Map<string, string> = new Map();

    constructor(formId: string) {
        this.form = document.getElementById(formId) as HTMLFormElement;
        this.bindEvents();
    }

    private bindEvents() {
        this.form.addEventListener("submit", (e) => {
            e.preventDefault();
            this.handleSubmit();
        });

        // リアルタイムバリデーション
        this.form.addEventListener("input", (e) => {
            const target = e.target as HTMLInputElement;
            this.validateField(target.name, target.value);
        });
    }

    private validateField(fieldName: string, value: string): boolean {
        switch (fieldName) {
            case "name":
                if (!value.trim()) {
                    this.setError(fieldName, "名前は必須です");
                    return false;
                }
                break;
            case "email":
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) {
                    this.setError(
                        fieldName,
                        "有効なメールアドレスを入力してください"
                    );
                    return false;
                }
                break;
            case "age":
                const age = parseInt(value);
                if (isNaN(age) || age < 0 || age > 150) {
                    this.setError(fieldName, "有効な年齢を入力してください");
                    return false;
                }
                break;
        }

        this.clearError(fieldName);
        return true;
    }

    private setError(fieldName: string, message: string) {
        this.errors.set(fieldName, message);
        this.updateErrorDisplay(fieldName, message);
    }

    private clearError(fieldName: string) {
        this.errors.delete(fieldName);
        this.updateErrorDisplay(fieldName, "");
    }

    private updateErrorDisplay(fieldName: string, message: string) {
        const errorElement = document.getElementById(`${fieldName}-error`);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = message ? "block" : "none";
        }
    }

    private handleSubmit() {
        const formData = new FormData(this.form);
        const customerData: CustomerFormData = {
            name: formData.get("name") as string,
            email: formData.get("email") as string,
            age: parseInt(formData.get("age") as string),
        };

        // バリデーション
        let isValid = true;
        Object.entries(customerData).forEach(([key, value]) => {
            if (!this.validateField(key, value.toString())) {
                isValid = false;
            }
        });

        if (isValid) {
            this.onSubmit(customerData);
        }
    }

    protected onSubmit(data: CustomerFormData) {
        // オーバーライドして使用
        console.log("Customer data:", data);
    }
}
```

## 次のステップ

TypeScript でのデータバインディングと UI 管理を理解したら、[07_Rust と TypeScript の連携.md](./07_RustとTypeScriptの連携.md) でフロントエンドとバックエンドの連携方法を学習しましょう。
